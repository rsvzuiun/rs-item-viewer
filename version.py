import winreg


def get_version(sub_key: str) -> str:
    dw_version, _ = winreg.QueryValueEx(
        winreg.OpenKeyEx(winreg.HKEY_CURRENT_USER, sub_key), "Version"
    )
    return f"v{dw_version / 10000:.4f}"


if __name__ == "__main__":
    print("JP", get_version(R"Software\L&K Logic Korea\Red Stone for Japan"))
    print("KR", get_version(R"Software\L&K Logic Korea\Red Stone"))
