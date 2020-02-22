# 关于动态服务器的需求

1. 用户输入用户名和密码 按`注册/登录`按钮 => done
   1. HTML main.js => done
2. 如果走注册线 => done
   1. 上面的信息会被写进数据库 => done
      1. registerUser.JSON => done
3. 如果走登录线 => done
   1. 用户界面跳转到登录页面 => done
   2. 显示用户名 ID => done
4. 后端种 cookie => done
   1. 话说为啥要种 cookie？？
      1. 因为跳转页面以后 没东西可以保留用户信息呀
      2. 反过来说如果不跳转也就不需要了？？
      3. **注意几级域名哟**
   2. 记得别让 JS 改 cookie 因为 JS 能改用户也能改 `http-only` => done
   3. 改了以后会怎么办 他就可以用别人账号登陆了呀 的可能性
5. 好吧即使 JS 不能改 f12 还是能改 => done
   1. 加密
      1. jwt //以后学一下 `TODO`
      2. md5 加密 //垃圾 不安全 以后补充 `TODO`
   2. 把信息隐藏到服务器 => done
      1. 服务器
         1. 有用户数据 => done
         2. 生成随机数给浏览器 => done
         3. 这个随机数跟用户数据绑定 => done
         4. 而且每次生成 => done
         5. timeOut 还不知道怎么搞 //`TODO`
6. 注销
   1. 删 session => done
   2. 删 cookie => done
   3. 但是浏览器后退没有防住。。 => done by `no-store`
7. 防止密码泄露 //`TODO`

# 残

1. 注销 浏览器后退那次没防住
   1. `no-store`搞定
   2. `no-cache`不会 以后再说了 w
2. 加密的那段
   1. https://coolshell.cn/articles/5353.html
   2. 看不懂 以后去大厂直接看看就知道了 懒得动脑子
