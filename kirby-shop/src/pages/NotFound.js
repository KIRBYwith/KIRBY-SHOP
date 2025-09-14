import React from 'react';
import Header from '../components/common/Header';
import Footer from '../components/common/Footer';

const NotFound = () => (
  <>
    <Header />
    <div style={{
      minHeight: 350,
      textAlign: 'center',
      padding: 80
    }}>
      <h1 style={{ color: "#FF69B4", fontSize: 54, marginBottom: 12 }}>404</h1>
      <h2>페이지를 찾을 수 없습니다.</h2>
      <p style={{ color: "#888" }}>
        요청하신 주소에 해당하는 페이지가 존재하지 않습니다.<br/>
        <a href="/" style={{ color: "#FF69B4", textDecoration: "underline" }}>메인으로 돌아가기</a>
      </p>
    </div>
    <Footer />
  </>
);

export default NotFound;
