import { useState } from "react";
import "./App.css";
import "bootstrap/dist/css/bootstrap.min.css";
import data from "./data.js";
import {Navbar, Container, Nav, Tab} from "react-bootstrap";

function App(){
  let [shoes] = useState(data);
  let [tab,탭변경] = useState(1)
  // let tab = useState(1)은 작동하지 않는다. 이는 useState의 반환값이 [값, 값변경함수]인 array를 기본으로 하기 때문이다.
  
  return (
    <div>
      {/* Step 1. html css로 미리 디자인 */}
      <Nav variant="tabs"  defaultActiveKey="link0">
        {/* defaultActiveKey는 사이트가 열렸을때 기본적으로 눌려있을 버튼 */}
          <Nav.Item>
            {/* Step 3. 버튼 조작하기 */}
            <Nav.Link eventKey="link0" onClick ={() => 탭변경(0)}
            >버튼0</Nav.Link>
            {/* 버튼마다 eventkey라는 속성을 잘쓰라고 돼어있음 */}
          </Nav.Item>
          <Nav.Item>
            <Nav.Link eventKey="link1" onClick ={() => 탭변경(1)}
            >버튼1</Nav.Link>
          </Nav.Item>
          <Nav.Item>
            <Nav.Link eventKey="link2" onClick ={() => 탭변경(2)}
            >버튼2</Nav.Link>
          </Nav.Item>
      </Nav>
      {/* Step 2. 탭 상태를 저장해둘 state 필요 */}
      {/* {
        tab ==0 ? <div>내용0</div> : null
      }
      {
        tab ==1 ? <div>내용1</div> : null
      } 
      // {/* 삼항 연산자는 여러개를 한번에 쓸 수 없다.
      */}      
      <TabContent tab ={tab}/>
    </div> 
  )
}
// Step 2를 if문으로 쓰고 싶으면 function 밖에서 써야함.
function TabContent(props){
  if(props.tab == 0){
    return <div>내용0</div>
    // retrun을 꼭 써줘야한다
  }
  if(props.tab == 1){
    return <div>내용1</div>
  }
  if(props.tab == 2){
    return <div>내용2</div>
  }
}
// props 축약버전. props안써도 바로 이렇게 연결시킬 수 있음.
// function TabContent(tab){
//   if(tab == 0){
//     return <div>내용0</div>
//     // retrun을 꼭 써줘야한다
//   }
//   if(tab == 1){
//     return <div>내용1</div>
//   }
//   if(tab == 2){
//     return <div>내용2</div>
//   }
// }

// [<div>내용0</div>,<div>내용1</div>,<div>내용2</div>][숫자] 이렇게 하면 앞의 array 중 숫자에 해당하는 순번 값이 나옴
// 위dp TabContent랑 연결시켜서 쓸 수 있음

export default App;