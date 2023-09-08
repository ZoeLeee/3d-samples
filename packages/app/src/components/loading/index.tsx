import { Spin } from "antd";

export const LoadingComponent = ({ title = "加载中。。。" }) => {
  return (
    <Spin
      tip={title}
      size="large"
      style={{
        position: "fixed",
        left: 0,
        right: 0,
        bottom: 0,
        top: 0,
        margin: "auto",
        zIndex: 1,
        width: "100%",
        height: "100vh",
        maxHeight: "100vh",
        background: "rgba(255,255,255,.5)",
      }}
    >
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      ></div>
    </Spin>
  );
};
