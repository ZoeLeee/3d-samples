import { useEffect, useRef } from "react";
import { renderHome } from "../engine/babylonjs/home";
import { Card, Space } from "antd";
import { Link } from "react-router-dom";

const List = [
  {
    label: "Babylonjs",
    path: "/bjs",
    icon: "/Babylon.js_Logo.png",
  },
  {
    label: "Threejs",
    path: "/tjs",
    icon: "/threejs.svg",
  },
  {
    label: "Canvas2D",
    path: "/2d",
    icon: "/threejs.svg",
  },
  {
    label: "开源",
    path: "/open-source",
    icon: "/threejs.svg",
  },
];

export default function Root() {
  const canvas2Ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    let dispose;
    if (canvas2Ref.current!) {
      dispose = renderHome(canvas2Ref.current!);
    }
    return () => {
      dispose?.();
    };
  }, []);

  return (
    <div id="detail" style={{ width: "100%", height: "100%" }}>
      <canvas style={{ width: "100%", height: "100%" }} ref={canvas2Ref} />
      <Space
        style={{
          position: "fixed",
          left: "5%",
          top: "5%",
        }}
      >
        {List.map((item) => (
          <Link to={item.path} key={item.label}>
            <Card
              hoverable
              style={{
                width: 140,
                height: 200,
                textAlign: "center",
                padding: 2,
                background: "#2b485c",
              }}
              cover={
                <img
                  style={{
                    width: "80%",
                    margin: "auto",
                  }}
                  src={item.icon}
                />
              }
            >
              <Card.Meta title={item.label} style={{ color: "#fff" }} />
            </Card>
          </Link>
        ))}
      </Space>
      <div
        style={{
          position: "fixed",
          bottom: "2%",
          width: "100%",
          textAlign: "center",
        }}
      >
        <a
          href="https://beian.miit.gov.cn/"
          target="_blank"
          style={{ color: "#479f52" }}
        >
          闽ICP备19012108号
        </a>
      </div>
      <a
        className="github-fork-ribbon"
        href="https://github.com/ZoeLeee/3d-samples"
        target="_blank"
        data-ribbon="Fork me on GitHub"
        title="Fork me on GitHub"
      >
        Fork me on GitHub
      </a>
    </div>
  );
}
