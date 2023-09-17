import { DataTexture, UnsignedByteType } from 'three';
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js';

export function LoadHDR(url: string): Promise<DataTexture> {
    return new Promise(res => {
        new RGBELoader()
            // .setDataType(UnsignedByteType) // alt: FloatType, HalfFloatType
            //@ts-ignore
            .load(url, (texture: DataTexture) => {
                console.log('texture: ', texture);


                // texture.encoding = RGBEEncoding;//设置编码属性的值
                // texture.minFilter = NearestFilter;//当一个纹素覆盖小于一个像素时，贴图将如何采样
                // texture.magFilter = NearestFilter;//当一个纹素覆盖大于一个像素时，贴图将如何采样
                texture.wrapS = 1001;
                texture.wrapT = 1001;
                texture.flipY = false;
                res(texture);
            });
    });
}