import React, { useCallback, useMemo, useState } from "react";
import {
  CarryOutOutlined,
  CheckOutlined,
  FormOutlined,
} from "@ant-design/icons";
import { Select, Switch, Tree } from "antd";
import type { DataNode } from "antd/es/tree";
import {
  ArcRotateCamera,
  Color3,
  Mesh,
  Node,
  PBRMaterial,
  Scene,
  TransformNode,
} from "@babylonjs/core";
import { zoomToNode } from "@/engine/utils";

const map = new Map<number, Mesh | TransformNode>();

const parse = (nodes: (Mesh | TransformNode)[]) => {
  const tree: DataNode[] = [];

  for (const node of nodes) {
    map.set(node.uniqueId, node);
    tree.push({
      title: node.name,
      key: node.uniqueId,
      icon: <CarryOutOutlined />,
      children: parse(node.getChildren()),
    });
  }

  return tree;
};

export const NodeTree: React.FC<{
  nodes: (Mesh | TransformNode)[];
  scene: Scene;
}> = ({ nodes, scene }) => {
  const tree = useMemo(() => {
    map.clear();
    return parse(nodes);
  }, [nodes, scene]);

  const highlight = (selectedKeys: React.Key[]) => {
    const cache = new Set();

    const h = (node: Mesh) => {
      console.log("file: index.tsx:49 ~ h ~ node:", node);
      if ("emissiveColor" in node.material) {
        if (!node.material.metadata?.emissiveColor) {
          node.material.metadata = {
            emissiveColor: node.material.emissiveColor,
          };
        }
        node.material.emissiveColor = Color3.Gray();
      }
      node.visibility = 1.0;
      node.renderingGroupId = 1;
      node.material.transparencyMode = 2;
    };

    const r = (node: Mesh) => {
      if (
        "emissiveColor" in node.material &&
        node.material?.metadata?.emissiveColor
      ) {
        node.material.emissiveColor = node.material?.metadata?.emissiveColor;
      }
      node.visibility = 0.1;
      node.renderingGroupId = 0;
      node.material.transparencyMode = 2;
    };

    const nodes = map.values();

    for (const node of nodes) {
      if (cache.has(node.uniqueId)) continue;

      if (node instanceof Mesh && node.geometry) {
        if (selectedKeys.includes(node.uniqueId)) {
          h(node);
        } else {
          r(node);
        }
      } else {
        const ms = node.getChildren();
        for (const m of ms) {
          if (m instanceof Mesh && m.geometry) {
            cache.add(m.uniqueId);
            if (selectedKeys.includes(m.uniqueId)) {
              h(m);
            } else {
              r(m);
            }
          }
        }
      }
    }
  };

  const onSelect = useCallback(
    (selectedKeys: React.Key[], info: any) => {
      highlight(selectedKeys);

      zoomToNode(
        map.get(selectedKeys[0] as number),
        scene.activeCamera as ArcRotateCamera
      );
    },
    [scene]
  );

  return (
    <Tree
      showLine
      showIcon
      onSelect={onSelect}
      treeData={tree}
      defaultExpandAll
    />
  );
};
