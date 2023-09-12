import React, { useMemo, useState } from "react";
import {
  CarryOutOutlined,
  CheckOutlined,
  FormOutlined,
} from "@ant-design/icons";
import { Select, Switch, Tree } from "antd";
import type { DataNode } from "antd/es/tree";
import {
  Color3,
  Mesh,
  Node,
  PBRMaterial,
  Scene,
  TransformNode,
} from "@babylonjs/core";

const map = new Map<number, Mesh | TransformNode>();

const parse = (nodes: Node[]) => {
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

export const NodeTree: React.FC<{ nodes: Node[] }> = ({ nodes }) => {
  const tree = useMemo(() => {
    map.clear();
    return parse(nodes);
  }, [nodes]);

  const onSelect = (selectedKeys: React.Key[], info: any) => {
    for (const key of selectedKeys) {
      const node = map.get(key);
      const selectNodes = [node, ...node.getChildMeshes()];
      for (const n of selectNodes) {
        if (n instanceof Mesh && n.material) {
          const mtl = n.material as PBRMaterial;

          mtl.emissiveColor = Color3.Gray();
        }
      }
    }
  };

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
