from flask import Flask, Blueprint, request, jsonify
from flask_cors import CORS
from pymongo import MongoClient
from datetime import datetime
from bson import ObjectId

app = Flask(__name__)
CORS(app)

# MongoDB 연결
db = MongoClient().dashboard_db

# Blueprint 생성
dashboard_bp = Blueprint('dashboard', __name__, url_prefix='/api')

@dashboard_bp.get("/projects")
def get_projects():
    """모든 프로젝트 조회"""
    projects = list(db.CHECK_LIST.find())
    
    # ObjectId를 문자열로 변환하고 프론트엔드 형식으로 변환
    for project in projects:
        project['_id'] = str(project['_id'])
        project['id'] = project['_id']
        
        # META_INFO에서 프로젝트 정보 추출
        meta_info = project.get('META_INFO', {})
        project['projectId'] = project['_id']  # _id를 projectId로 사용
        project['projectName'] = meta_info.get('project_name', 'Unknown Project')
        project['inlinePassRate'] = meta_info.get('inline_pass_rate', 0.0)
        project['elecPassRate'] = meta_info.get('elec_pass_rate', 0.0)
        project['issueResponseIndex'] = meta_info.get('issue_response_index', 0.0)
        project['wipAchievementRate'] = meta_info.get('wip_achievement_rate', 0.0)
        project['deadlineAchievementRate'] = meta_info.get('deadline_achievement_rate', 0.0)
        project['finalScore'] = meta_info.get('final_score', 0.0)
        project['remark'] = meta_info.get('remark', '')
        
        # datetime 객체를 ISO 문자열로 변환
        created_at = meta_info.get('created_at')
        if isinstance(created_at, datetime):
            project['createdAt'] = created_at.isoformat()
        else:
            project['createdAt'] = datetime.utcnow().isoformat()
            
        updated_at = meta_info.get('updated_at')
        if isinstance(updated_at, datetime):
            project['updatedAt'] = updated_at.isoformat()
        else:
            project['updatedAt'] = datetime.utcnow().isoformat()
        
        # 기존 키 제거
        del project['META_INFO']
        del project['PERMISSION']
        del project['items']
        del project['BASE_LIST']
        del project['ISSUE_LIST']
    
    return jsonify(projects)

@dashboard_bp.post("/issues")
def create_issue():
    """새 이슈 생성"""
    data = request.get_json()
    
    project_id = data['projectId']
    try:
        object_id = ObjectId(project_id)
    except:
        return jsonify({'error': 'Invalid project ID format'}), 400
    
    # 프로젝트 존재 확인
    project = db.CHECK_LIST.find_one({'_id': object_id})
    if not project:
        return jsonify({'error': 'Project not found'}), 404
    
    # 새 이슈 생성 (프론트엔드 형식 그대로)
    new_issue = {
        "id": str(ObjectId()),  # 고유한 이슈 ID 생성
        "issue": data['issue'],
        "summary": data.get('summary', ''),
        "status": data.get('status', 'pending'),
        "img": data.get('img', ''),
        "detail": data.get('detail', ''),
        "start": data.get('start', ''),
        "end": data.get('end', ''),
        "file": data.get('file', ''),
        "progress": data.get('progress', ''),
        "projectId": project_id,  # 프로젝트 ID 추가
        "createdAt": datetime.utcnow().isoformat(),
        "updatedAt": datetime.utcnow().isoformat()
    }
    
    # ISSUE_LIST에 새 이슈 추가
    db.CHECK_LIST.update_one(
        {'_id': object_id},
        {'$push': {'ISSUE_LIST': new_issue}}
    )
    
    return jsonify(new_issue), 201

@dashboard_bp.put("/issues/<issue_id>")
def update_issue(issue_id):
    """이슈 업데이트"""
    data = request.get_json()
    
    project_id = data.get('projectId')
    if not project_id:
        return jsonify({'error': 'Project ID is required'}), 400
    
    try:
        project_object_id = ObjectId(project_id)
    except:
        return jsonify({'error': 'Invalid project ID format'}), 400
    
    # 프로젝트 존재 확인
    project = db.CHECK_LIST.find_one({'_id': project_object_id})
    if not project:
        return jsonify({'error': 'Project not found'}), 404
    
    # ISSUE_LIST에서 해당 이슈 찾기
    issue_list = project.get('ISSUE_LIST', [])
    issue_index = None
    
    for i, issue in enumerate(issue_list):
        if issue.get('id') == issue_id:
            issue_index = i
            break
    
    if issue_index is None:
        return jsonify({'error': 'Issue not found'}), 404
    
    # 이슈 업데이트
    updated_issue = {
        "id": issue_id,
        "issue": data.get('issue', issue_list[issue_index].get('issue', '')),
        "summary": data.get('summary', issue_list[issue_index].get('summary', '')),
        "status": data.get('status', issue_list[issue_index].get('status', 'pending')),
        "img": data.get('img', issue_list[issue_index].get('img', '')),
        "detail": data.get('detail', issue_list[issue_index].get('detail', '')),
        "start": data.get('start', issue_list[issue_index].get('start', '')),
        "end": data.get('end', issue_list[issue_index].get('end', '')),
        "file": data.get('file', issue_list[issue_index].get('file', '')),
        "progress": data.get('progress', issue_list[issue_index].get('progress', '')),
        "projectId": project_id,
        "createdAt": issue_list[issue_index].get('createdAt', datetime.utcnow().isoformat()),
        "updatedAt": datetime.utcnow().isoformat()
    }
    
    # ISSUE_LIST 업데이트
    db.CHECK_LIST.update_one(
        {'_id': project_object_id},
        {'$set': {f'ISSUE_LIST.{issue_index}': updated_issue}}
    )
    
    return jsonify(updated_issue)

@dashboard_bp.get("/projects/<project_id>/issues")
def get_project_issues(project_id):
    """프로젝트별 이슈 조회"""
    try:
        object_id = ObjectId(project_id)
    except:
        return jsonify({'error': 'Invalid project ID format'}), 400
    
    # 프로젝트 조회
    project = db.CHECK_LIST.find_one({'_id': object_id})
    if not project:
        return jsonify({'error': 'Project not found'}), 404
    
    issue_list = project.get('ISSUE_LIST', [])
    
    # 각 이슈를 to_dict()로 변환하여 JSON 직렬화 문제 해결
    converted_issues = []
    for issue in issue_list:
        # ObjectId나 다른 특수 타입을 문자열로 변환
        converted_issue = {}
        for key, value in issue.items():
            if isinstance(value, ObjectId):
                converted_issue[key] = str(value)
            elif isinstance(value, datetime):
                converted_issue[key] = value.isoformat()
            else:
                converted_issue[key] = value
        converted_issues.append(converted_issue)
    
    return jsonify(converted_issues)

@dashboard_bp.get("/color-settings")
def get_color_settings():
    """색상 설정 조회"""
    color_settings = list(db.color_settings.find())
    result = {}
    for setting in color_settings:
        result[setting['field_name']] = {
            'high': setting['high_threshold'],
            'low': setting['low_threshold']
        }
    return jsonify(result)

@dashboard_bp.put("/color-settings")
def update_color_settings():
    """색상 설정 업데이트"""
    data = request.get_json()
    
    for field_name, thresholds in data.items():
        db.color_settings.update_one(
            {'field_name': field_name},
            {
                '$set': {
                    'high_threshold': thresholds.get('high', 90.0),
                    'low_threshold': thresholds.get('low', 70.0),
                    'updated_at': datetime.utcnow()
                }
            },
            upsert=True
        )
    
    return jsonify({'message': 'Color settings updated successfully'})

@dashboard_bp.get("/statistics")
def get_statistics():
    """프로젝트 통계 조회"""
    total_projects = db.CHECK_LIST.count_documents({})
    
    if total_projects == 0:
        return jsonify({
            'total': 0,
            'win': 0,
            'draw': 0,
            'lose': 0
        })
    
    # 색상 설정 가져오기
    color_settings = list(db.color_settings.find())
    final_score_setting = next((s for s in color_settings if s['field_name'] == 'finalScore'), None)
    
    if not final_score_setting:
        return jsonify({'error': 'Final score color settings not found'}), 500
    
    high_threshold = final_score_setting['high_threshold'] / 100
    low_threshold = final_score_setting['low_threshold'] / 100
    
    win = 0
    draw = 0
    lose = 0
    
    projects = list(db.CHECK_LIST.find())
    for project in projects:
        meta_info = project.get('META_INFO', {})
        final_score = meta_info.get('final_score', 0.0)
        
        if final_score >= high_threshold:
            win += 1
        elif final_score >= low_threshold:
            draw += 1
        else:
            lose += 1
    
    return jsonify({
        'total': total_projects,
        'win': round((win / total_projects) * 100),
        'draw': round((draw / total_projects) * 100),
        'lose': round((lose / total_projects) * 100)
    })

@dashboard_bp.get("/health")
def health_check():
    """서버 상태 확인"""
    return jsonify({
        'status': 'healthy',
        'timestamp': datetime.utcnow().isoformat(),
        'message': 'Dashboard API Server is running',
        'database': 'connected'
    })

# Blueprint 등록
app.register_blueprint(dashboard_bp)

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)