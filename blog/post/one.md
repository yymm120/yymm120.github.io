> 在应用开发前，开发者应尽可能全面考虑应用支持多设备的情况，避免在后期加入新的类型设备时对应用架构进行大幅调整。



## 概念

### "一多"的含义



一套代码工程，一次开发上架，多端按需部署。它有两种部署方式:

- A: 编译为相同的HAP或HAP组合,适用于UX和功能相似的设备上.

- B: 编译为不同的HAP或HAP组合,适用于UX和功能差异的设备上.



### 开发流程



1. 应用设计（包含界面UX设计、业务功能设计）

2. 工程设计和创建

3. 功能代码实现。



### 应用程序包结构



Ability和Library两种模块类型, Ability可以打包为HAP格式, Library可以打包为HAR和HSP两种格式. HAP是可以独立安装运行的应用程序,有Entry类型和Feature类型两种HAP.而HAR是静态共享包,只能发布到OHPM私有仓库或者OHpm公共仓库.HAR的特点是代码和资源会重复拷贝. HSP是动态共享包,可以在应用内共享,HSP的特点是多模块引用HSP不会造成代码和资源的拷贝.



### 工程结构



鸿蒙文档推荐三层工程结构

1. common (公共能力层) 存放工具库和公共组件. 一个项目通常只有一个common模块. 它会被编译为HAR或者HSP包.

2. features (基础特性层) 这个目录内的每一个子目录都是一个feature类型的模块, feature用来存放具有独立功能的UI和业务逻辑. 它们会被编译为Feature类型的HAP包.

3. products (产品定制层) 这个目录内的每一个子目录都是一个Entry模块,每个Entry模块都是一个HAP包,作为应用主入口.



整个工程最终构建为一个APP包,应用以APP包的形式发布到应用市场.



### 四种设备屏幕宽度是多少?



鸿蒙UI只需关注四大类设备设计:

- 超小型设备,[0,320)

- 小型设备,[32,600)

- 中型设备,[600,840)

- 大型设备,[840,+∞)



### 依赖关系



在多模块工程下, 依赖关系通过每个模块中的`oh-package.json5`文件来修改.





### 页面开发的"一多"能力有哪些



#### 布局能力

自适应布局 (根据相对关系自动变化,以适应外部容器变化的布局方式)

- 拉伸,均分(),占比(),缩放(),延伸(),隐藏(),折行(Flex支持折行) (七种)

| 组件   | 拉伸                                            | 均分                            | 占比                                  | 缩放        | 延伸       | 隐藏            | 折行          |
| ------ | ----------------------------------------------- | ------------------------------- | ------------------------------------- | ----------- | ---------- | --------------- | ------------- |
| Row    | Blank组件                                       | justifyContent<br />SpaceEvenly | 百分比或者 <br />子组件的layoutWeight | aspectRatio | Scroll组件 | displayPriority | /             |
| Column | Blank组件                                       | justifyContent<br />SpaceEvenly | 百分比或者 <br />子组件的layoutWeight | aspectRatio | Scroll组件 | displayPriority | /             |
| Flex   | Blank组件<br />或子组件flexGrow和flexShrink属性 | justifyContent<br />SpaceEvenly | 百分比或者 <br />子组件的layoutWeight | aspectRatio | /          | displayPriority | FlexWrap.Wrap |

响应式布局 (根据断点,栅格,平方方向的变化而自动变化的布局方式)

- 断点, 媒体查询, 栅格布局 (三种)

| 组件    | 使用方法                                                     |      |
| ------- | ------------------------------------------------------------ | ---- |
| GridRow | 配合GridCol子组件使用                                        |      |
| Grid    | 配合GridItem子组件使用, 通过改变不同断点下的rowsTemplate和columnsTemplate实现不同的布局效果 |      |
| List    | 需要配合ListItem子组件使用, 通过改变不同断点下的lanes等属性实现不同的布局效果 |      |
| Swiper  | 轮播展示子组件, 通过改变不同断点下的displayCount和indicator等属性,实现不同的布局效果 |      |
| Tabs    | 需要配合TabContent子组件, 通过改变不同断点下的vertical和barPosition属性, 实现不同的布局效果. |      |



#### 交互归一

- 输入事件: 悬浮, 点击, 双击, 长按, 上下文菜单, 拖拽, 轻扫, 滚动及平移, 缩放, 旋转. (10种)

| 输入 | 悬浮    | 点击    | 双击       | 长按             | 上下文菜单  | 拖拽 | 轻扫         | 滚动及平移 | 缩放         | 旋转            |
| ---- | ------- | ------- | ---------- | ---------------- | ----------- | ---- | ------------ | ---------- | ------------ | --------------- |
| 接口 | onHover | onClick | TapGesture | LongPressGesture | ContentMenu | Drag | SwipeGesture | PanGesture | PinchGesture | PotationGesture |

将A组件拖放到B组件中的过程:

| 事件        | 功能和使用方法                                        |
| ----------- | ----------------------------------------------------- |
| onDragStart | 绑定A组件, 触控屏长按/鼠标左键按下后移动两种方式触发  |
| onDragEnter | 绑定B组件, 触控屏手指/鼠标移动进入B组件瞬间触发       |
| onDragMove  | 绑定B组件,触控屏手指/鼠标在B组件内移动触发            |
| onDragLeave | 绑定B组件,触控屏手指/鼠标移动退出B组件瞬间触发        |
| onDrop      | 绑定B组件,在B组件内,触控屏手指抬起/鼠标左键松开时触发 |



#### 多态组件

鸿蒙文档暂未提供

#### 资源使用

应用资源文件存放在每个模块的resource路径下, resource包含`element`目录和`media`目录. 其中`element`目录下存放JSON文件, 而media目录下存放媒体文件. 需要注意的是, `element`目录下的每个JSON文件都只能存放同一种类型的数据, 例如Color.json只能存放color, 其中的value只能是字符串, 而boolean.json中的value只能存放boolean类型.

访问应用资源通过`$r("app.type.name")`的形式引用.

系统资源是系统中预定义的资源, 通过`$r("sys.type.resource_id")`的形式引用.



### 功能开发中,"一多"能力有哪些



#### 系统能力 SysCap

SysCap是SystemCapability的缩写, 指操作系统中每个相对独立的特性. 包括蓝牙, WIFI, NFC, 摄像头等等.

系统能力包括三个核心概念

1. 设备支持能力集 - 设备配置文件中配置的能力集

2. 应用要求能力集 - 应用配置文件中配置的系统能力集
3. 联想能力集 - IDE可以联想的系统能力集, 也在应用配置文件中配置.

> 只有当"应用要求能力集"是"设备支持能力集"的子集时, 应用才可以在该设备上分发.



##### 如何动态判断支持是否满足要求

方法一:

`canIUse`接口, 例如:

`canIUse("SystemCapability.Communication.NFC.Core")`

方法二:

`import`的结果是否是undefine, 例如

`import {nfcController } from "@kit.ConnectivityKit;"`



##### 如何配置联想能力集来帮助开发

一般IDE会自动根据工程来配置联想能力集.

手动配置则需要修改`syscap.json`文件





### 常见问题

#### 如何查询设备类型?

- 设备类型分为: `default`, `tablet`, `tv`, `wearable`, `2in1`等

可以通过命令行的方式查询

```bash
# 方法1
hdc shell param get "const.product.devicetype"
# 方法2
hdc shell cat /etc/param/ohos.para | grep const.product.devicetype
```

也可以通过代码动态查询

```typescript
import { deviceInfo } from "@kit.BasicServicesKit"

aboutToAppear() {
     this.deviceType= deviceInfo.deviceType
   }
```

#### 如何在不同设备上为Ability配置不同的启动模式

- `Ability`支持单实例,多实例,指定实例三种启动模式.

启动模式可以在配置文件`module.json5`中通过`launchType`字段配置.

| 启动模式  | 描述     | 说明                                                         |
| --------- | -------- | ------------------------------------------------------------ |
| multiton  | 多实例   | 每次startAbility都会启动一个新的实例                         |
| singleton | 单实例   | 系统中最多只可以存在一个实例, startAbility时, 如果系统中已存在相应的Ability实例,则复用该实例 |
| specified | 指定实例 | 运行时由Ability内部业务决定是否创建多实例                    |

例如在默认设备屏幕尺寸中, 屏幕尺寸较小, 采用`multiton`模式会消耗更多资源, 所以经常采用singleton模式.

然而平板的屏幕尺寸较大, 可以同时存在文档编辑和网页浏览的情况, 使用`multiton`可以提升用户体验.

`launchType`的值为specified时, 系统会根据AbilityStage的onAcceptWant的返回值确定是否创建新的实例. 如果onAcceptWant的key已经存在, 则复用key所对应的Ability, 如果key不存在,则创建新的Ability.

```typescript
import { AbilityStage, Want } from "@kit.AbilityKit"
import { deviceInfo } from "@kit.BasicServicesKit"

export default class MyAbilityStage extends AbilityStage {
    private generateKey(): string {
        if (deviceInfo.deviceType === "tablet") {
            // 用时间戳确保每次都是不同的key,确保每次都创建新的Ability实例
            return deviceInfo.deviceType + (new Date()).valueOf()
        }
        // 如果不是平板,那就返回设备类型作为key
        return deviceInfo.deviceType
    }
    onAcceptWant(want: Want): string {
        return this.generateKey()
    }
}
```



#### 如何开启自由窗口

自由窗口功能默认是关闭的,可以通过以下方式开启自由窗口功能

```shell
# 取出窗口配置文件, 并将<decor enable="false"></decor>修改为<decor enable="true"></decor>
hdc file recv system /etc/window/resources/window_manager_config.xml
# 以可读写的模式重新挂载根目录, 并更新配置文件
hdc shell mount -o rw,remount /
hdc file send window_manager_config.xml system/etc/windows/resources/window_manager_config.xml
# 重启设备, 配置生效
hdc shell reboot
```

鼠标在应用顶部悬浮, 既可换出窗口工具栏

点击窗口工具栏中的缩放按钮, 可以让应用以自由窗口的模式显示.



#### 如何限制自由窗口的尺寸条件范围

可以在应用配置文件中限制各个Ability的自由窗口尺寸调节范围. 

比如限制最小宽度: `minWindowWidth`或者最大宽高比`maxWindowRatio` 





#### 如何获取组件的尺寸

可以通过区域组件变化事件来获取指定组件的尺寸. 

- onAreaChange

#### 如何解决ListItem内容过大

1. 可以设置`.lanes({minLength, maxLength})` 限制最大最小宽度

2. 可以借助`GridRow`和断点来控制`ListItem`的列数. 

    `.lanes(this.breakPoint === 'sm' ? 1 : 2)` 



#### 如何解决Swiper的图片过大

配合GridRow和断点, 设置Swiper的前后边距

- `.prevMargin(this.breakPoint === "sm"? 0: 100)`
- `.nextMargin(this.breakPoint === "sm"? 0: 100)`



#### 如何解决单张图片过大

通过设置`aspectRatio`和`ConstrainSize`属性,  限制图片的比例和尺寸.

```typescript
Image()
    .aspectRatio(0.5)
	.constraintSize({ maxWidth: 240, minWidth: 180 })
```



#### 如何设置Grid的宽高比

```typescript
Grid()
	.aspectRatio(1)
```



























