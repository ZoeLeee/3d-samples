import React, { useMemo } from "react";
import { Col, Divider, Layout, Row } from "antd";
import { RenderMap } from "../babylon-canvas/map";
import { Link } from "react-router-dom";
import { Card } from "antd";

const { Meta } = Card;
const { Header, Footer, Sider, Content } = Layout;
const style: React.CSSProperties = { background: "#0092ff", padding: "8px 0" };

const headerStyle: React.CSSProperties = {
  color: "#fff",
  height: 64,
  paddingInline: 50,
  lineHeight: "64px",
  backgroundColor: "#7dbcea",
  display: "flex",
  alignItems: "center",
};

export const SamplesComponent: React.FC = () => {
  const list = useMemo(() => {
    const list = [];
    for (const key in RenderMap) {
      list.push({
        key,
        title: RenderMap[key].title,
      });
    }

    return list;
  }, []);

  return (
    <Layout style={{ height: "100%" }}>
      <Layout.Header style={headerStyle}>
        <Link to="/">
          {" "}
          <h1 style={{ color: "#fff" }}>BabylonJS Samples</h1>
        </Link>
      </Layout.Header>
      <Content>
        <Row gutter={16}>
          {list.map((item) => (
            <Col className="gutter-row" xs={4} span={6}>
              <Link to={`/bjs/${item.key}`}>
                <Card
                  hoverable
                  cover={
                    <img
                      alt="example"
                      src={
                        RenderMap[item.key].image ??
                        "https://os.alipayobjects.com/rmsportal/QBnOOoLaAfKPirc.png"
                      }
                    />
                  }
                >
                  <Meta title={item.title} description={item.title} />
                </Card>
              </Link>
            </Col>
          ))}
          <Col className="gutter-row" xs={4} span={6}>
            <Link to={`/bjs`}>
              <Card
                hoverable
                cover={
                  <img
                    alt="example"
                    src={
                      "https://os.alipayobjects.com/rmsportal/QBnOOoLaAfKPirc.png"
                    }
                  />
                }
              >
                <Meta title="gltf压缩" description="开发中" />
              </Card>
            </Link>
          </Col>
        </Row>
      </Content>
    </Layout>
  );
};
