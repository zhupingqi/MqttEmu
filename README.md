[广告]

### 年级大了

年级大了, 熬不动了，卖卖茶叶，喜欢喝茶的猿人们，来看看如何泡出一杯美味的茶吧 
![泡泡茶](https://www.paopaocha.top/images/ad/paopaocha.jpg "泡泡茶")

[泡泡茶 https://www.paopaocha.top/](https://www.paopaocha.top/)

### 简介

MqttEmu是使用Electron构建桌面应用程序，允许运行在Windows、macOS和Linux上。

MqttEmu是一个物联网设备仿真器，主要使用Mqtt协议进行网络通讯，实现物联网设备与物联网平台的消息通讯。

MqttEmu适用于没有物联网硬件开发经验或者暂时不需要进行物联网硬件开发的人员，MqttEmu可以在没有物联网硬件的前提下进行网联网服务端开发，并进行服务端功能性测试。

### 如何下载

百度网盘链接：https://pan.baidu.com/s/1AixcifzQbiruDDEoesE5UQ 

提取码：txtr

### 界面

![主界面](https://images.gitee.com/uploads/images/2021/1207/143716_5da6c10b_1970137.png "屏幕截图.png")

主界面大致分为功能区、链接区、桌面区三个部分。功能区为常用功能命令，例如：创建设备。链接区提供github及帮助链接。桌面区用于操作当前放入桌面设备。设备只有放入桌面才可以连接到物联网。

### 快速入门

本部分将会通过使用MqttEmu创建一个极简的物联网设备带你了解如何使用MqttEmu模拟物联网设备。

> 本部分使用**阿里云**作为物联网服务器，您需要首先使用阿里云物联网创建一个产品，并新建一个设备。

##### 1. 创建虚拟设备

在阿里云创建完物联网设备后，回到我们的应用，点击主界面功能区的**新设备**打开设备创建窗口。

![新设备](https://images.gitee.com/uploads/images/2021/1207/145412_e7d95fbb_1970137.png "屏幕截图.png")

名称填写为您设备的名称，这里填写为test1,模式选择**标准**，生成器选择**阿里云**，ProductKey、DeviceName、DeviceSecret可以在您创建的阿里云物联网产品设备上找到，将这些信息填入对应区域。其他选项如下图所选，然后点击**填充**按钮，连接阿里云所需要的相关参数会自动进行填充。

![设备信息](https://images.gitee.com/uploads/images/2021/1207/145656_99846154_1970137.png "屏幕截图.png")

其他暂时不需要填写，点击**提交**按钮，添加这个设备。

##### 2. 将设备添加至桌面区

在主界面功能区点击设备列表，将打开设备列表面板，这里您将看到您刚刚创建的设备。

![设备列表](https://images.gitee.com/uploads/images/2021/1207/151215_cc3c44a7_1970137.png "屏幕截图.png")

> 设备下面的三个功能按钮为 1：添加至桌面 2：编辑设备 3：删除设备

我们点击第一个按钮，将设备添加桌面区，然后关闭设备列表面板。

##### 3. 设备上线

![桌面设备](https://images.gitee.com/uploads/images/2021/1207/163949_efe6d83f_1970137.png "屏幕截图.png")

将设备添加至桌面后，会出现如图所示界面，1位置为设备功能区，2位置为上报订阅区，3位置为日志区

点击设备功能区的第一个连接按钮，设备即可上线。

##### 4. 查看日志

![日志](https://images.gitee.com/uploads/images/2021/1207/171400_91094182_1970137.png "屏幕截图.png")

日志区域分为左右两个部分，左侧为日志动作及日志时间，右侧为日志内容。

##### 5. 编辑发布消息

![发布和订阅消息](https://images.gitee.com/uploads/images/2021/1208/083804_e0ce15a6_1970137.png "屏幕截图.png")

点击上图所示1位置按钮，添加新的发布，此时会打开新发布面板。

![新发布](https://images.gitee.com/uploads/images/2021/1208/111747_6bb2073b_1970137.png "屏幕截图.png")

在名称处填写您的发布名称，这里填写property.post,topic处填写

 /sys/**product_key**/**device_name**/thing/event/property/post

此处product_key，device_name替换成您的阿里三要素信息，其他选择默认。

> 间隔为自动提交间隔时间，单位为秒

代码处填写以下内容


```
function transformPayload(rawData) {
    var jsonObj = {
        "id":123456,
        "params":{
            "CurrentHumidity":88,
            "CurrentTemperature":38.8
        },
        "version":"1.0",
        "method":"thing.event.property.post"
    };
    return jsonObj;
}
```

> 发布会计算函数运算结果，在**标准模式**下会将函数返回的文本数据或JSON对象发布到物联网服务器上。**透传模式**则发布Buffer数据到物联网服务器。模式是新建虚拟设备时设置的。

单击提交保存发布设置。

##### 6. 自动手动发送消息

回到桌面区后，保持设备连接状态（参见步骤三）。新建消息会根据步骤5中上报间隔设置，定期上报。若想手动上报，可在上报订阅区右键点击新创建的上报消息，再点击出现菜单的上报菜单进行手动上报。

![消息上报右键菜单](https://images.gitee.com/uploads/images/2021/1208/142807_1ba8e95c_1970137.png "屏幕截图.png")

> 若需禁用自动上报，可以点击禁用菜单，禁用后，可以再次启用。
点编辑菜单可以编辑上报消息
删除可以删除该上报消息

### 传感器和公共脚本

传感器是使用js模拟现实设备传感器的模块，可以被上报、订阅消息重复使用。对于简单或不常用的模拟数据可以直接写到上报或订阅消息中。若传感器会被设备仿真器频繁使用，建议建立独立的传感器，供上报、订阅消息重复使用。

脚本为公共函数，可以被传感器及上传、订阅消息内的脚本所调用，通常完成一些常见操作，例如ID生成，数据格式转化等。

本部分通过建立一个简单的温湿度传感器，供上报消息使用来演示传感器和公共脚本如何使用。

##### 1. 创建一个传感器

点击桌面区域功能区的传感器菜单，打开传感器列表面板，再点击右上方+号，新建传感器。

![传感器列表](https://images.gitee.com/uploads/images/2021/1208/145429_06f547a4_1970137.png "屏幕截图.png")

打开的传感器面板

![传感器面板](https://images.gitee.com/uploads/images/2021/1208/145550_32925f24_1970137.png "屏幕截图.png")

名称填写温湿度传感器，备注填写读取本地温湿度，代码如下


```
function readSensor($) {
    let res = {
        Temperature :  Number((Math.random()*50).toFixed(1)),
        Humidity : Math.round((Math.random()*100))
    };
  
    return res;
}
```

该传感器返回两个数字量，一个温度，带1位小数浮点数，一个湿度，类型为整数。返回的结果是一个JSON对象。

> 所有传感器结果必须返回JSON对象，数值才能传送给上报消息使用。

点击提交保存结果后，您将在传感器列表面板找到新建的传感器。

##### 2. 编辑公共脚本

点击主界面功能区脚本菜单，弹出脚本编辑面板，录入脚本如下：

```
//获取当前时间的时间戳 用于生成消息ID
function timestamp() {
    return Math.round(new Date() / 1000);
}
```
点击提交保存结果。

##### 3. 重新编译上报消息

在以上介绍的新建的上报消息property.post菜单上点击右键，点击编辑菜单，打开编辑消息面板。

在变量处选择温湿度传感器的两个变量，如图所示

![输入图片说明](https://images.gitee.com/uploads/images/2021/1208/150918_286e75d3_1970137.png "屏幕截图.png")

点击蓝色按钮，使变量穿梭到右侧，如下所示

![输入图片说明](https://images.gitee.com/uploads/images/2021/1208/151052_3303ff4f_1970137.png "屏幕截图.png")

上下箭头按钮可以调节变量顺序，我们将湿度调节到上面，如下所示

![输入图片说明](https://images.gitee.com/uploads/images/2021/1208/151314_86450fea_1970137.png "屏幕截图.png")

代码区粘贴代码如下

```
/**
* 将设备raw数据转换为json格式数据
* 入参：rawData 数组
* 出参：jsonObj JSON对象 不能为空
*/
function transformPayload(rawData) {
    var jsonObj = {
        "id":timestamp(),
        "params":{
            "CurrentHumidity":rawData[0],
            "CurrentTemperature":rawData[1]
        },
        "version":"1.0",
        "method":"thing.event.property.post"
    };
    return jsonObj;
}
```

其中rawData数据来源于上面所设置的变量部分，数组内容顺序于所调整的一致。jsonObj属性id使用了公共库timestamp函数结果，点击提交保存结果。

回到桌面区，保持设备连接状态，自动或手动上报后，通过观察日志您将看到传感器和公共脚本上报结果。

### 订阅

##### 1. 新建订阅

点击[编辑发布消息](#5-%E7%BC%96%E8%BE%91%E5%8F%91%E5%B8%83%E6%B6%88%E6%81%AF)部分2标记处按钮，打开新建订阅面板。

![订阅面板](https://images.gitee.com/uploads/images/2021/1209/084905_c916c004_1970137.png "屏幕截图.png")

名称处填写 property.set,主题处填写 /sys/{product_key}/{device_name}/thing/service/property/set

> 此处product_key，device_name替换成您的阿里三要素信息

其他保持默认，点击提交保存订阅。

> Publish用于收到订阅消息后进行上报，这里可以选择一个已保存的上报消息。通常将该类型的上报设置为**禁用**，只有在接受到对应订阅消息后才自动进行消息上报。在该类上报消息处理函数中会将订阅payload传入给第二个参数，以便进行相关操作。以下为订阅上报类消息函数模型


```
/**
* 将设备raw数据转换为json格式数据
* 入参：rawData 传感器数据对象
* 入参：subPayload 订阅payload对象
* 出参：jsonObj JSON对象 不能为空
*/
function transformPayload(rawData,subPayload) {
    var jsonObj = {
        "id":subPayload.id,
        "params":{},
        "version":"1.0",
        "method":"thing.event.property.post"
    };
    
    if(subPayload.params.LowTemperature !== undefined)
        jsonObj.params.LowTemperature = subPayload.params.LowTemperature;
        
    if(subPayload.params.MaxTemperature !== undefined)
        jsonObj.params.MaxTemperature = subPayload.params.MaxTemperature;    
    
    return jsonObj;
}
```

##### 2. 订阅测试

回到主界面后，保持设备仿真器处于连接状态。手动发送消息或等待自动发送消息完成，您将在日志中观察到发布及订阅消息的结果。

![发布及订阅消息](https://images.gitee.com/uploads/images/2021/1209/093013_57fc0882_1970137.png "屏幕截图.png")








