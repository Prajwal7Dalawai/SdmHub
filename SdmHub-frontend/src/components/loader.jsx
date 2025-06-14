import React from 'react';
import styled from 'styled-components';

export default function Loader(){
  return (
    <StyledWrapper>
      <div className="wrapper">
        <div className="circle" />
        <div className="circle" />
        <div className="circle" />
        <div className="shadow" />
        <div className="shadow" />
        <div className="shadow" />
      </div>
    </StyledWrapper>
  );
}

const StyledWrapper = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  z-index: 9999;
  background: linear-gradient(120deg, #f7f7f7 0%, #f0f0f0 40%, #e4e4e4 100%);
  background-image: 
    linear-gradient(120deg, #f7f7f7 0%, #f0f0f0 40%, #e4e4e4 100%),
    radial-gradient(circle at 60% 40%, #ffffff 0%, #f3f3f3 80%, transparent 100%);
  backdrop-filter: blur(3px);
  display: flex;
  align-items: center;
  justify-content: center;

  .wrapper {
    width: 200px;
    height: 60px;
    position: relative;
    z-index: 1;
  }

  .circle {
    width: 20px;
    height: 20px;
    position: absolute;
    border-radius: 50%;
    background: linear-gradient(135deg, #8B0000, #B22222 60%, #DC143C);
    left: 15%;
    transform-origin: 50%;
    animation: circle7124 .5s alternate infinite ease;
  }

  @keyframes circle7124 {
    0% {
      top: 60px;
      height: 5px;
      border-radius: 50px 50px 25px 25px;
      transform: scaleX(1.7);
    }

    40% {
      height: 20px;
      border-radius: 50%;
      transform: scaleX(1);
    }

    100% {
      top: 0%;
    }
  }

  .circle:nth-child(2) {
    left: 45%;
    animation-delay: .2s;
  }

  .circle:nth-child(3) {
    left: auto;
    right: 15%;
    animation-delay: .3s;
  }

  .shadow {
    width: 20px;
    height: 4px;
    border-radius: 50%;
    background: linear-gradient(90deg, #8B0000, #B22222 60%, #DC143C);
    position: absolute;
    top: 62px;
    transform-origin: 50%;
    z-index: -1;
    left: 15%;
    filter: blur(1px);
    animation: shadow046 .5s alternate infinite ease;
  }

  @keyframes shadow046 {
    0% {
      transform: scaleX(1.5);
    }

    40% {
      transform: scaleX(1);
      opacity: .7;
    }

    100% {
      transform: scaleX(.2);
      opacity: .4;
    }
  }

  .shadow:nth-child(4) {
    left: 45%;
    animation-delay: .2s
  }

  .shadow:nth-child(5) {
    left: auto;
    right: 15%;
    animation-delay: .3s;
  }`;

