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

const Samples2DComponent: React.FC = () => {
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
          <Col className="gutter-row" xs={4} span={6}>
            <Link to={`vis-list`}>
              <Card hoverable cover={<img alt="example" src="/dodream2.jpg" />}>
                <Meta title="画布列表" description="使用canvas绘制长列表" />
              </Card>
            </Link>
          </Col>
        </Row>
      </Content>
    </Layout>
  );
};

export default Samples2DComponent;
