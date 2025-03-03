import { Spin } from 'antd';

function Loading() {
  return (
    <>
      <div className="loader-container flex flex-col items-center justify-center">
      <Spin size="large" />
        {/* <div className="loader">
          <span>R</span>
          <span>P</span>
          <span>M</span>
        </div> */}
      </div>
    </>
  );
}

export default Loading;
