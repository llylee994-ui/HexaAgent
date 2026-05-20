from typing import Literal, Optional
from pydantic import BaseModel


class YaoLine(BaseModel):
    position: int
    type: Literal["yang", "yin"]
    changing: bool = False
    gan: str = ""
    zhi: str = ""
    wuxing: str = ""
    liuqin: str = ""
    shi_ying: Optional[Literal["shi", "ying"]] = None
    xun_kong: bool = False
    liushen: str = ""
    fush_liuqin: str = ""
    fush_zhi: str = ""


class Sizhu(BaseModel):
    year: str
    month: str
    day: str
    hour: str


class HexagramData(BaseModel):
    mode: Literal["auto", "manual"] = "auto"
    hexagram_name: str = ""
    changed_to: Optional[str] = None
    yao_lines: list[YaoLine] = []
    changed_lines: list[YaoLine] = []
    yue_jian: str = ""
    ri_chen: str = ""
    xun_kong: list[str] = []
    sizhu: Optional[Sizhu] = None
    question: str = ""


class ChatRequest(BaseModel):
    message: str
    session_id: str = "default"
    mode: Literal["auto", "manual"] = "auto"
    hexagram_data: Optional[HexagramData] = None


class ChatResponse(BaseModel):
    answer: str
    hexagram: Optional[HexagramData] = None
    thinking_chain: list[str] = []
