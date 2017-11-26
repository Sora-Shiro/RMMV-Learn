> 本目录下的博客是博主自己阅读《Learn Pixi.js》[^1]所记录的代码片段，并附加了自己的修改和理解。

# 基本使用

包括建立 stage，生成 renderer，使用 `loader` 加载图片素材，转化为 texture，生成 sprite，添加 sprite 进 stage 中，最后使用 `renderer.render(stage)` 渲染。
另外，可以参考[《pixi.js教程中文版--基础篇》](https://www.cnblogs.com/afrog/p/4056378.html)。

```javascript
//Aliases
let Container = PIXI.Container,
    autoDetectRenderer = PIXI.autoDetectRenderer,
    loader = PIXI.loader,
    resources = PIXI.loader.resources,
    Sprite = PIXI.Sprite;
//Create the stage and renderer
let stage = new Container(),
    renderer = autoDetectRenderer(256, 256);
document.body.appendChild(renderer.view);
//Use Pixi's built-in `loader` object to load an image
loader
    .add("images/pixie96x48.png")
    .load(setup);
//This `setup` function will run when the image has loaded
function setup() {
    //Create the sprite, add it to the stage and render it
    let pixie = new Sprite(resources["images/pixie96x48.png"].texture);
    //Change the sprite's position
    pixie.x = 96;
    pixie.y = 128;
    //Add the sprite to the stage
    stage.addChild(pixie);
    //Render the stage
    renderer.render(stage);
}
```

# frame 切图仔[^2]

有时候我们需要准备 tileset （可以翻译成“图片集”，类似于 RM 里的很多小图拼成的大图片，使用的时候则是取其中一部分）来代替单独的 img，这样在处理速度和内存利用上都比较高效，而且 pixi 还会进行一定的优化。这个时候，切图就要用到 `texture.frame` 属性：

```javascript
function setup() {
    // Using aliases
    let TextureCache = PIXI.utils.TextureCache;
    let Sprite = PIXI.Sprite;
    //Create the `tileset` sprite from the texture
    let texture = TextureCache["images/tileset.png"];
    //Create a rectangle object that defines the position and
    //size of the sub-image you want to extract from the texture
    let rectangle = new Rectangle(160, 256, 32, 32);
    //Tell the texture to use that rectangular section
    texture.frame = rectangle;
    //Create the sprite from the texture
    let adventuress = new Sprite(texture);
    //Position the sprite on the canvas
    adventuress.x = 64;
    adventuress.y = 64;
    //Scale the sprite up so it's 3 times bigger than the original image
    adventuress.scale.set(3, 3);
    //Add the sprite to the stage
    stage.addChild(adventuress);

    //Render the stage
    renderer.render(stage);
}
```

[^1]: Rex van der Spuy - Learn Pixi.js，一本能让人快速入门 Pixi 的书。

[^2]: 之前和一位叫 F.star 的前端工程师兼交互设计师做过一个小游戏（没错就是 [Swipe](https://github.com/Sora-Shiro/Swipe)）。当时他把 psd 设计稿发给我，对我说“开始干活吧切图仔！”。从此以后，我在写程序遇到需要自己处理图片的情况时，脑海里总会浮现这三个富含调侃的词汇 :)。