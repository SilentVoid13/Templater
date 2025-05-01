# 常见问题

## Windows系统下Unicode字符（表情符号等）无法正常工作？

Windows上的`cmd.exe`和`powershell`已知存在Unicode字符问题。

您可以查看 https://github.com/SilentVoid13/Templater/issues/15#issuecomment-824067020 寻找解决方案。

另一个好的解决方案（可能是最佳方案）是使用 [Windows Terminal](https://www.microsoft.com/en-us/p/windows-terminal/9n0dx20hk701) 并在Templater的设置中将其设置为默认shell。

另一个包含可能适合您的解决方案的资源：[https://stackoverflow.com/questions/49476326/displaying-unicode-in-powershell](https://stackoverflow.com/questions/49476326/displaying-unicode-in-powershell)