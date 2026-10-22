# TypeScript와 선언적 코드

## 네이밍 기본값

| 대상 | 기준 |
| --- | --- |
| 파일 | kebab-case. 프레임워크 예약 파일명·생성 파일은 해당 규약 유지 |
| 변수·함수 | camelCase |
| Boolean | is/has/should 등 의미에 맞는 접두사 |
| 타입·인터페이스·클래스 | PascalCase. 인터페이스에 I 접두사 사용하지 않기 |
| 모듈 수준 고정 상수·enum 멤버 | ALL_CAPS. 모든 const 지역변수를 대문자로 바꾸지 않기 |
| 이벤트 핸들러 구현 / props | handleClick / onClick |
| Props 타입 | ComponentNameProps |
| 요청·응답 타입 | LoginRequest / LoginResponse처럼 의미를 명시 |

공개 export, API 필드, 저장 데이터 키는 이름 변경의 호환성을 먼저 확인한다.

## Import와 타입

- External → internal alias → relative 순서를 기본으로 하되 기존 정렬 도구의 그룹 설정을 따른다. 미사용·중복 import를 제거하고 타입 전용 import는 `import type`을 사용한다.
- `any` 대신 `unknown` + 타입 가드, 제네릭 또는 적절한 구체 타입을 사용한다. 프로젝트의 strict 검사를 유지한다.
- `as Type`과 non-null assertion(`!`)으로 불확실성을 숨기지 않는다. narrowing, 명시적 null 검사, discriminated union을 우선한다.
- `as const`는 허용한다. DOM·외부 라이브러리의 타입 한계로 단언이 필요한 경우 실제 전제와 이유를 좁은 위치에 설명한다. 존재하지 않는 lint 규칙을 disable하거나 파일 전체 검사를 끄지 않는다.
- `@ts-ignore`로 문제를 덮지 않는다. 외부 타입 결함을 우회해야 한다면 원인과 범위를 확인하고 저장소의 예외 정책을 따른다.
- 불필요한 union/enum 변환을 하지 않는다. 새 상태 모델은 문자열 union 또는 discriminated union을 기본으로 하며 런타임 enum이 필요한 경우에만 enum을 사용한다.
- 명확한 타입 추론은 유지한다. 외부 경계나 복잡한 반환 계약에는 타입을 명시하되 쿼리·함수의 제네릭을 무조건 중복 작성하지 않는다.
- `?.`와 `??`는 결측이 허용되는 의미에만 사용한다. 필수 데이터 누락을 빈 값이나 성공 결과로 숨기지 않는다.

## 함수와 안티패턴

| 피할 형태 | 판단과 개선 |
| --- | --- |
| `// 1. ... 2. ...`로 여러 책임을 나열하는 긴 함수 | 의미 단위로 분리. 번호 주석만으로 위반이라고 판단하지 않기 |
| 깊은 if/else·중첩 삼항 연산자 | guard clause, early return, 단순 분기 사용 |
| 같은 키에 따른 반복 분기 | 매핑 객체나 전략이 더 명확한 경우 적용. 작은 분기까지 추상화하지 않기 |
| 변환 루프에서 외부 상태를 변경 | 값을 먼저 계산하고 경계에서 적용. 순서·원자성·메모리 비용을 보존 |
| `let result` 후 try/catch에서 반복 대입 | 반환값을 갖는 작은 함수와 const 사용을 검토. 오류 전파를 바꾸지 않기 |
| 의미 없는 전달용 래퍼·한 줄 헬퍼 | 호출부에서 이해가 쉬우면 인라인 유지 |
| `ZERO = 0`, `FIRST_INDEX = 0` 등 자명한 상수 | 문맥상 의미가 불명확하거나 공유되는 설정만 이름 부여 |
| 미사용 export·중복 로직·디버그 출력 | 사용처 확인 후 삭제·통합. 운영 로깅은 프로젝트 logger 사용 |

함수가 약 30줄을 넘거나 분기가 많으면 책임 분리를 살핀다. 줄 수를 통과 기준으로 쓰지 않으며, 길다는 이유만으로 맥락을 여러 파일에 흩뜨리지 않는다.

```ts
// 불필요한 추상화
const addOne = (value: number) => value + 1;
const FIRST_INDEX = 0;

// 의미를 드러내는 상수와 순수 변환
const MIN_COLUMN_WIDTH = 50;
const clampColumnWidth = (width: number) => Math.max(width, MIN_COLUMN_WIDTH);
```

순수함수 추출은 입력과 출력으로 계약을 설명할 수 있고, 독립적인 의미나 반복 사용이 있을 때 수행한다. 문법이 비슷하다는 이유만으로 서로 다른 도메인 책임을 합치지 않는다.
