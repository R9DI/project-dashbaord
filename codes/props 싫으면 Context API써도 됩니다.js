import { useState, useEffect } from "react";
import "./App.css";
import "bootstrap/dist/css/bootstrap.min.css";
import data from "./data.js";
import {Navbar, Container, Nav, Tab} from "react-bootstrap";

function App(){
  let [shoes] = useState(data);
  let [tab,tabChange] = useState(1)
  
  return (
    <div>
      <Nav variant="tabs"  defaultActiveKey="link0">
          <Nav.Item>
            <Nav.Link eventKey="link0" onClick ={() => tabChange(0)}
            >버튼0</Nav.Link>
          </Nav.Item>
          <Nav.Item>
            <Nav.Link eventKey="link1" onClick ={() => tabChange(1)}
            >버튼1</Nav.Link>
          </Nav.Item>
          <Nav.Item>
            <Nav.Link eventKey="link2" onClick ={() => tabChange(2)}
            >버튼2</Nav.Link>
          </Nav.Item>
      </Nav>
      <TabContent tab ={tab}/>
    </div> 
  )
}
function TabContent({tab}){
  // tab이라는 props의 state가 변할 때 end를 부탁하자는 컨샙으로
  let [fade,setFade] = useState('')
  useEffect (()=>{
    // setFade('') 
    // setFade('end') 이렇게 하면 안됨
    // 왜 안될까? react 18버전 이후로 automatich batching 기능이 생김
    // state를 변경하는 함수들이 인접해있으면, 재랜더링을하지않고 마지막에 한번에 state를 변경하려고함

    setTimeout(()=>setFade('end'),10)
    return (a)=>{
      clearTimeout(a)
      setFade('')
    }
  },[tab])
  return <div className={'start ' + fade}>
  {/* start 뒤에 띄어쓰기가 있어야됨 */}
  {/* return <div className={`start ${fade}`}> 이렇게 써도 똑같다(백틱 이용)*/}
    {/* end 를 붙이면 서서히 나타남 */}
    {[<div>내용0</div>,<div>내용1</div>,<div>내용2</div>][tab]}
  </div>

}


export default App;