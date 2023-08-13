import React, { useMemo } from "react";
import { Col, Divider, Layout, Row } from "antd";
import { RenderMap } from "../babylon-canvas/map";
import { Link, useLocation } from "react-router-dom";
import { Card } from "antd";
import { ThreeRenderMap } from "../three-canvas/map";

const { Meta } = Card;
const { Content } = Layout;

const headerStyle: React.CSSProperties = {
  color: "#fff",
  height: 64,
  paddingInline: 50,
  lineHeight: "64px",
  backgroundColor: "#7dbcea",
  display: "flex",
  alignItems: "center",
};

const SamplesComponent: React.FC = () => {
  const location = useLocation();

  const map = useMemo(() => {
    return location.pathname.includes("bjs") ? RenderMap : ThreeRenderMap;
  }, [location?.pathname]);

  const list = useMemo(() => {
    const list = [];
    for (const key in map) {
      list.push({
        key,
        title: map[key].title,
      });
    }

    return list;
  }, [map]);

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
              <Link to={`${item.key}`}>
                <Card
                  hoverable
                  cover={
                    <img
                      alt="example"
                      src={
                        map[item.key].image ??
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
        </Row>
      </Content>
    </Layout>
  );
};

export default SamplesComponent;
