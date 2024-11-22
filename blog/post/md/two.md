## ArkData 方舟数据管理



### 运作机制

1. 用户首选项 (Preferences) 常用于保存应用配置信息、用户偏好设置等。
    1. 数据存储
    2. 数据缓存
    3. 订阅通知
2. 键值型数据管理 (KV-Store)  应用需要使用键值型数据库的分布式能力时，KV-Store会将同步请求发送给DatamgrService由其完成跨设备数据同步。
    1. 但版本数据库
    2. 设备协同数据库
    3. 订阅通知
    4. 数据库加密
3. 关系型数据管理 (RelationalStore) 应用需要使用关系型数据库的分布式能力时，RelationalStore部件会将同步请求发送给DatamgrService由其完成跨设备数据同步。
    1. 数据存储
    2. 分类分级
    3. 数据库加密
    4. 分布式同步
4. 分布式数据对象 (DataObject)  如果应用需要重启后仍获取之前的对象数据（包含跨设备应用和本设备应用），则使用数据管理服务（DatamgrService）的对象持久化能力，做暂时保存。
    1. 跨设备同步
    2. 对象持久化
    3. 订阅通知
5. 跨应用数据管理 (DataShare) 提供了数据提供者provider、数据消费者consumer以及同设备跨应用数据交互的增、删、改、查以及订阅通知等能力。
    1. 查询谓词
    2. 数据结果集
    3. 跨应用访问助手
    4. 跨应用数据共享
6. 统一数据管理框架。 (UDMF) 提供了数据跨应用、跨设备交互标准，定义了跨应用、跨设备数据交互过程中的数据语言
    1. 标准化数据定义
    2. 归一化数据通道
    3. 跨应用数据协同
    4. 跨设备数据协同

![img](img/0000000000011111111.20241119112013.1968534207210368376961520299308650001231000000280037F2CEFB2ADF10F22D78B769D258E855032118923197411496B7DA86C2796DC0.jpg)

- 数据管理服务（DatamgrService）：提供其它部件的同步及跨应用共享能力，包括RelationalStore和KV-Store跨设备同步，DataShare静默访问provider数据，暂存DataObject同步对象数据等。





### 标准化数据定义

UDMF定义了数据管理框架提供了"标准化数据定义"作为统一的HarmonyOS数据语言.

- 标准化数据类型(UTD): 用于解决同一种数据类型, 存在不同类型描述方式的问题, 例如jpg/jpeg图片类型, 可以使用image/jpeg, jpg, jpeg或者image/picutre等方式进行描述.
- 标准化数据结构: 鸿蒙为标准化数据类型提供了部分数据解构, 一般用于跨设备的数据交互, 比如拖拽. (目前只有四个标准化数据类型拥有标准画数据结构, PlainText, HyperLink, HTML, OpenHarmonyAppItem)





#### UTD 标准化数据类型基础

标准化数据类型分为物理和逻辑两类, 它们的根节点分别为`general.entity`和`general.object`. 

- general.entity包含`file`,`directory`, `symlink`
- general.object包含`media`, `text`, `archive`

#### 定义自定义数据类型

由于预置标准数据类型无法穷举所有数据类型, 因此支持应用自定义数据类型, 并将自定义数据类型注册到系统中.

##### 工作原理

应用安装时,UTD会读取应用中自定义的数据类型进行安装, 并校验数据类型是否符合约束条件. 如果需要使用其他应用定义的数据类型, 需要在应用开发时一并写入自定义数据类型配置文件中.

##### 约束限制

类型定义必须要有以下字段:

1. TypeId: 由bundleName + 具体类型名组成 `"com.example.mySecondHap.image"` 
2. BelongingToTypes: 定义数据类型的归属, 确保不能形成环形依赖.
3. FilenameExtensions: 应用自定义文件名后缀, 可以缺省, 也可以为多个, 以`.`开头
4. MIMETypes: 应用自定义标准化数据类型所管理的web消息数据类型. 可以缺省, 可以为多个.
5. Description: 简要描述
6. ReferenceURL: 关于该类型的参考链接URL

##### 开发步骤

直接在`resources\rawfile\arkdata\utd\`目录下新增`utd.json5`文件.

在utd.json5文件中可以定义`UniformDataTypeDeclarations`数组和`ReferenceUniformDataTypeDeclarations`数组



### 应用数据持久化

目前有三种持久化方式:

1. 用户首选项 (Preferences) 
2. 键值型数据库 (KV-Store)
3. 关系型数据库 (relationalStore) 



用户首选项会将数据缓存在内存中, 随着存放的数据量越多, 占用的内存越大.



##### 开发步骤

step1: 导入preferences

```typescript
import { preferences } from "@kit.ArkData";
```

step2: 获取Preferences实例

```typescript
let dataPreferences: preferences.Preferences | null = null;

class EntryAbility extends UIAbility {
  onWindowStageCreate(windowStage: window.windowStage) {
    let options: preferences.Options = { name: 'myStore' };
    dataPreferences = preferences.getPreferencesSync(this.context, options);
  }
}
```

step3: 写入数据

```typescript
if (dataPreferences.hasSync("startup")) {
    
} else {
    dataPreferences.putSync("startup", "auto");
}
```

step4: 读取数据

```typescript
let val = dataPreferences.getSync("startup", "default");
```

step5: 删除数据

```typescript
dataPreferences.deleteSync("startup")
```

step6: 数据持久化

```typescript
dataPreferences.flush((err: BusinessError) => {
    if (err) {
        console.log(err)
        return ;
    }
    console.log("Successd in flushing")
})
```

step7: 订阅数据变更

```typescript
// 当flush()执行时,触发回调
let observer = (key: string) => {
    console.log("the key changed.")
}
dataPreferences.on("change", observer);
dataPreferences.put("startup", "manual", (err: BusinessError) => {
    if (err) [
        console.error(err);
        return;
    ]
    console.log("successded in putting")
    if (dataPreferences !== null) {
        dataPreferences.flush((err: BusinessError) => {
            if (err) {
                console.log(err)
                return ;
            }
            console.log("sucessed in flushing")
        })
    }
})
```

step8: 删除指定文件

```typescript
// 会删除这个preference, 若是已持久化, 则也会删除对应的文件
preferences.deletePreferences(this.context, option, (err: BussinessError) => {
    if (err) {
        console.log(err);
        return;
    }
    console.log("successed")
})
```



##### 带有特殊字符的字符串如何从首选项中写入和读取

```typescript
import { util } from "@kit.ArkTS";
// 写入
let uInt8Array = new util.TextEncoder().encodeInto("~！@#￥%……&*（）——+？")
dataPreferences.putSync('uInt8', uInt8Array);
// 读取
let textDecoder = util.TextDecoder.create('utf-8');
let val = textDecoder.decodeToString(uInt8Array2 as Uint8Array);
```







