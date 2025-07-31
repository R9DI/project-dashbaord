import { useState } from "react";
import "./App.css";
import "bootstrap/dist/css/bootstrap.min.css";
import data from "./data.js";
import {Navbar, Container, Nav} from "react-bootstrap";

function App(){
  let [shoes] = useState(data);
  return (
    <div>
      <Navbar bg="dark" variant="dark">
        <Container>
        <Navbar.Brand href="#home">Navbar</Navbar.Brand>
        <Nav className="me-auto">
          <Nav.Link href="#home">Home</Nav.Link>
          <Nav.Link href="#features">Features</Nav.Link>
          <Nav.Link href="#pricing">Pricing</Nav.Link>
        </Nav>
        </Container>
      </Navbar>
      {shoes.map(function(item,index){
        return (
          <Modal1 shoe = {item} idx = {index} />
        )
      })}
    </div> 
  )
}

function Modal1(props){
  {/* fuction의 이름은 무조건 대문자로 시작해야된다 */}
  return(
    <div className="col-md-4">
      <img src = "https://codingapple1.github.io/shop/shoes1.jpg" width="80%" />
      <h4> {props.shoe[props.idx].title} </h4>
      <h4> {props.shoe[props.idx].title} </h4>
    </div>
    )
  }

export default App;