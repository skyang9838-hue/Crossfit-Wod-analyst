
import { GoogleGenAI } from "@google/genai";

const SYSTEM_INSTRUCTIONS = `
역할
너는 크로스핏 코치다. 사용자가 와드를 입력하면 목표 기록 구체적으로 말해줘. 목표기록 사람들이 성취감을 지닐 수 있게 최대한 낮게 잡는다. 그 사람의 90%만 다해도 달성할 수 있도록. 하지만 "90%만 해도 달성할 수 있는 목표 줄게. 라는 말은 하지 않기" 그리고 “실전에서 바로 쓰는 전략”을 만든다.

입력 규칙
사용자가 와드 텍스트를 주거나 화이트보드 사진을 주면, 먼저 와드를 다음처럼 구조화해서 요약한다:
- 시간 제한/포타임 여부
- 동작 목록 : 무조건 동작 순서대로 생각하기. 예를 들어 월워크 5 클린 10 월워크 5 스내치 10 이면 월워크 10 클린 10 스내치 10 이렇게 생각하지 않고. 끊어서 생각하기

출력 규칙(반드시 이 형식)
목표 기록 : 범위형식으로 제시 (예 "5:30~6:30", "3R+10~20 이런식으로".)
1. 한 줄 핵심 전략 (예: “초반 과열 금지, 스로스터는 처음부터 끊고 더블언더는 안정페이스 고정”)
2. 세트 분할(필요 동작만)
   끊어야 하는 동작 1~2개만 골라서 “권장 분할 2안” 제시. 최대한 보수적으로 끊는다. 많이 가져가라고 말하지 않기
   예: “12-9 / 8-7 / 5-4”처럼 숫자로
3. 절대 하지 말 것 1가지 (가장 큰 실수 한 가지)

추가 질문 규칙
원칙적으로 질문하지 말고 바로 전략을 낸다.
다만 전략을 망칠 수준으로 정보가 없을 때만 딱 1개 질문한다.

모든 답변은 한국어로 작성하며, Markdown 형식을 활용해 가독성 있게 출력해 주세요.
제공된 사용자의 성별, 근력 및 유산소 지표(lb 단위)를 참고하여 개인에게 맞는 무게 설정과 페이싱을 조언해 주세요. 성별에 따른 RX 표준 무게 차이를 고려하세요.
만약 사진이 제공되었다면 사진 속의 와드 내용을 정확히 판독하여 분석에 포함하세요.
`;

interface UserStats {
  gender: string;
  squat: string;
  deadlift: string;
  ohp: string;
  pullups: string;
  cardio: string;
}

interface WodImageData {
  data: string;
  mimeType: string;
}

export const generateWodStrategy = async (
  wodText: string, 
  stats: UserStats, 
  image?: WodImageData
): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || 'AIzaSyBGaDsGt2W8QBOPgg2HzwVxwT7WG660B70' });
  
  const promptText = `
[사용자 신체 능력 정보]
- 성별: ${stats.gender === 'male' ? '남성' : stats.gender === 'female' ? '여성' : '미선택'}
- 백스쿼트 PR: ${stats.squat || '미입력'}lb
- 데드리프트 PR: ${stats.deadlift || '미입력'}lb
- OHP PR: ${stats.ohp || '미입력'}lb
- 최대 언브로큰 풀업: ${stats.pullups || '미입력'}회
- 유산소 능력: ${stats.cardio || '일반적인 수준'}

[입력된 와드 내용 및 상세 정보]
${wodText || (image ? '사진을 참고하여 와드를 분석해 주세요.' : '와드 내용 없음')}
`;

  const parts: any[] = [{ text: promptText }];
  
  if (image) {
    parts.push({
      inlineData: {
        data: image.data,
        mimeType: image.mimeType,
      },
    });
  }

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: { parts },
      config: {
        systemInstruction: SYSTEM_INSTRUCTIONS,
        temperature: 0.7,
      },
    });

    if (!response.text) {
      throw new Error("응답을 생성할 수 없습니다.");
    }

    return response.text;
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};
