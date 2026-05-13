# 🧩 Compound Components 패턴

## 1. 개요

**Compound Components(컴파운드 컴포넌트)** 패턴은 React에서 **관련된 컴포넌트들이 함께 작동하면서도, 각각 독립적으로 제어 가능한 구조**를 만드는 설계 패턴이다.

HTML에서 이미 친숙한 예가 있다:

```html
<select>
  <option value="1">하나</option>
  <option value="2">둘</option>
</select>

<table>
  <thead><tr><th>이름</th></tr></thead>
  <tbody><tr><td>홍길동</td></tr></tbody>
</table>
```

`<select>`는 `<option>` 없이 의미가 없고, `<option>`은 `<select>` 밖에서 동작하지 않는다. 두 요소는 **암묵적으로 상태를 공유**하며 함께 작동한다.

React에서도 동일한 원리로, 하나의 부모 컴포넌트가 상태를 관리하고, 자식 컴포넌트들이 Context를 통해 그 상태를 소비하는 구조를 만들 수 있다.

---

## 2. 왜 Compound Components인가?

### 2.1 기존 방식의 문제점

#### Props Drilling 방식

```tsx
// ❌ Props가 너무 많고, 유연성이 없다
<Modal
  isOpen={isOpen}
  onClose={handleClose}
  title="삭제 확인"
  body="정말 삭제하시겠습니까?"
  confirmText="삭제"
  cancelText="취소"
  onConfirm={handleConfirm}
  showFooter={true}
  showCloseButton={true}
  size="md"
/>
```

**문제점:**
- 새로운 요구사항(예: 이미지 추가, 커스텀 버튼)이 생길 때마다 props가 계속 늘어남
- 컴포넌트 내부 구조가 고정되어 레이아웃 변경이 어려움
- 조건부 렌더링이 복잡해짐 (`showFooter`, `showCloseButton` 등)

#### Render Props 방식

```tsx
// ⚠️ 유연하지만 가독성이 떨어짐
<Modal
  isOpen={isOpen}
  onClose={handleClose}
  renderHeader={({ close }) => <CustomHeader onClose={close} />}
  renderBody={() => <CustomBody />}
  renderFooter={({ close, confirm }) => (
    <CustomFooter onClose={close} onConfirm={confirm} />
  )}
/>
```

**문제점:**
- JSX가 함수 안에 중첩되어 가독성이 떨어짐
- 인라인 함수가 매 렌더링마다 새로 생성됨
- 타입 정의가 복잡해짐

### 2.2 Compound Components의 해결책

```tsx
// ✅ 선언적이고 유연한 합성
<Modal open={isOpen} onClose={handleClose}>
  <Modal.Header>
    <Modal.Title>삭제 확인</Modal.Title>
    <Modal.CloseButton />
  </Modal.Header>
  <Modal.Body>
    <p>정말 삭제하시겠습니까?</p>
    <img src="warning.svg" alt="경고" />  {/* 자유롭게 추가! */}
  </Modal.Body>
  <Modal.Footer>
    <Modal.CancelButton>취소</Modal.CancelButton>
    <Modal.ConfirmButton onConfirm={handleConfirm}>삭제</Modal.ConfirmButton>
  </Modal.Footer>
</Modal>
```

**장점:**
- **유연한 합성**: 자식 컴포넌트의 순서, 추가, 제거가 자유로움
- **선언적 JSX**: HTML과 같은 자연스러운 구조
- **관심사 분리**: Header/Body/Footer가 각각 독립적인 관심사를 가짐
- **암묵적 상태 공유**: Context로 props drilling 없이 상태 전달

---

## 3. 핵심 구현 원리

### 3.1 두 가지 합성 방식

#### 방식 A: 정적 속성 (Object.assign)

```tsx
// 가장 단순한 방식 — Card 같은 UI 요소에 적합
function Card({ children }) {
  return <div className="card">{children}</div>;
}

Card.Header = function Header({ children }) {
  return <div className="card-header">{children}</div>;
};

Card.Title = function Title({ children }) {
  return <h3 className="card-title">{children}</h3>;
};

// 사용
<Card>
  <Card.Header>
    <Card.Title>제목</Card.Title>
  </Card.Header>
</Card>
```

#### 방식 B: Context + 정적 속성 (실전)

```tsx
// 상태 공유가 필요한 경우 — Modal, Tabs, Accordion 등
const ModalContext = createContext<ModalContextValue | null>(null);

function Modal({ open, onClose, children }) {
  // Context Provider로 상태를 제공
  return (
    <ModalContext.Provider value={{ open, onClose, defaultAction }}>
      <div className="modal-overlay">
        <div className="modal-content">{children}</div>
      </div>
    </ModalContext.Provider>
  );
}

// 자식은 Context로 상태를 소비
Modal.CloseButton = function CloseButton() {
  const { onClose } = useContext(ModalContext);
  return <button onClick={onClose}>✕</button>;
};
```

### 3.2 useModal + childrenArray 분석 — 실무 패턴

회사 프로젝트의 `BaseModal` + `useModal` 패턴은 Compound Components의 응용이다:

```tsx
export function useModal(initialOpen = false) {
  const [open, setOpen] = useState(initialOpen);
  const openModal = useCallback(() => setOpen(true), []);
  const closeModal = useCallback(() => setOpen(false), []);

  /**
   * childrenArray 분석 — 핵심!
   * React.Children.toArray로 자식을 순회하며
   * 포커스 가능한 요소, 기본 액션(ConfirmButton)을 자동으로 찾는다.
   */
  const analyzeChildren = useCallback((children: React.ReactNode) => {
    const childrenArray = React.Children.toArray(children);

    let defaultAction: (() => void) | null = null;

    childrenArray.forEach((child) => {
      if (!React.isValidElement(child)) return;

      const childType = child.type as React.ComponentType & { displayName?: string };

      // ConfirmButton 찾기 → Enter 키 기본 액션으로 등록
      if (childType?.displayName === "ModalConfirmButton") {
        defaultAction = child.props.onConfirm ?? null;
      }

      // Footer 안의 자식들도 재귀적으로 분석
      if (childType?.displayName === "ModalFooter" && child.props.children) {
        const footerChildren = React.Children.toArray(child.props.children);
        footerChildren.forEach((footerChild) => {
          if (!React.isValidElement(footerChild)) return;
          const fc = footerChild.type as React.ComponentType & { displayName?: string };
          if (fc?.displayName === "ModalConfirmButton") {
            defaultAction = footerChild.props.onConfirm ?? null;
          }
        });
      }
    });

    return { defaultAction };
  }, []);

  return { open, openModal, closeModal, analyzeChildren };
}
```

**핵심 아이디어:**

1. **`React.Children.toArray(children)`** — 자식 요소를 평탄한 배열로 변환
2. **`child.type.displayName`** — 컴포넌트의 이름을 확인해 특정 자식(예: ConfirmButton)을 식별
3. **재귀 분석** — Footer 안의 자식까지 들어가서 ConfirmButton의 `onConfirm` 콜백을 찾음
4. **Enter/Esc 키 연결** — 찾은 `defaultAction`을 Enter 키 이벤트에 바인딩

이렇게 하면 **사용자가 JSX를 어떻게 구성하든**, `childrenArray` 분석을 통해 `ConfirmButton`을 자동으로 찾고 Enter 키 액션에 연결할 수 있다.

### 3.3 BaseModal에서의 키보드 처리

```tsx
// BaseModal: Esc 키 처리
useEffect(() => {
  if (!open) return;
  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === "Escape") {
      e.preventDefault();
      onClose();  // Esc → 모달 닫기
    }
    if (e.key === "Enter") {
      e.preventDefault();
      defaultAction?.();  // Enter → ConfirmButton의 onConfirm 실행
    }
  };
  document.addEventListener("keydown", handleKeyDown);
  return () => document.removeEventListener("keydown", handleKeyDown);
}, [open, onClose, defaultAction]);
```

---

## 4. 실전 예제 분석

### 4.1 Modal (BaseModal + useModal + childrenArray)

가장 복잡한 예제. BaseModal이 오버레이, 포커스 트랩, Esc 키를 담당하고, useModal이 childrenArray 분석으로 Enter 키 액션을 자동 연결한다.

```tsx
<Modal open={modalOpen} onClose={() => setModalOpen(false)}>
  <Modal.Header>
    <Modal.Title>Compound Modal 🎉</Modal.Title>
    <Modal.CloseButton />
  </Modal.Header>
  <Modal.Body>
    <p>이 모달은 BaseModal을 기반으로 만들어졌습니다.</p>
  </Modal.Body>
  <Modal.Footer>
    <Modal.CancelButton>취소</Modal.CancelButton>
    <Modal.ConfirmButton onConfirm={() => setModalOpen(false)}>
      확인
    </Modal.ConfirmButton>
  </Modal.Footer>
</Modal>
```

**동작:**
- `Esc` 키 → `onClose` 호출 → 모달 닫기
- `Enter` 키 → `ConfirmButton.onConfirm` 호출 (childrenArray에서 자동 발견)
- 오버레이 클릭 → `onClose` 호출
- `X` 버튼 → `CloseButton`이 Context에서 `onClose` 소비

### 4.2 Accordion

Context로 열린 항목 상태를 공유하는 선언적 아코디언:

```tsx
<Accordion>
  <Accordion.Item value="react">
    <Accordion.Trigger>React란?</Accordion.Trigger>
    <Accordion.Content>...</Accordion.Content>
  </Accordion.Item>
  <Accordion.Item value="compound">
    <Accordion.Trigger>Compound Components란?</Accordion.Trigger>
    <Accordion.Content>...</Accordion.Content>
  </Accordion.Item>
</Accordion>
```

### 4.3 Tabs

활성 탭 상태를 Context로 관리:

```tsx
<Tabs defaultValue="overview">
  <Tabs.List>
    <Tabs.Trigger value="overview">개요</Tabs.Trigger>
    <Tabs.Trigger value="usage">사용법</Tabs.Trigger>
  </Tabs.List>
  <Tabs.Content value="overview">...</Tabs.Content>
  <Tabs.Content value="usage">...</Tabs.Content>
</Tabs>
```

### 4.4 Card (가장 단순한 형태)

Context 없이 정적 속성 합성만으로 구성:

```tsx
<Card>
  <Card.Image src="..." alt="코드" />
  <Card.Header>
    <Card.Title>React Compound Components</Card.Title>
    <Card.Description>선언적이고 유연한 패턴</Card.Description>
  </Card.Header>
  <Card.Footer>
    <Card.Action>자세히 보기 →</Card.Action>
  </Card.Footer>
</Card>
```

---

## 5. 패턴 비교

| 패턴 | 유연성 | 복잡도 | 대표 예시 |
|------|--------|--------|-----------|
| Props Drilling | ⭐ | 낮음 | `<Modal isOpen onClose title body />` |
| **Compound Components** | ⭐⭐⭐ | 중간 | `<Modal><Modal.Header>...</Modal>` |
| Render Props | ⭐⭐⭐ | 중간 | `<Modal render={({ close }) => ...} />` |
| Headless UI | ⭐⭐⭐⭐ | 높음 | Radix, Headless UI, Ark UI |

### 실무 라이브러리 예시

- **Radix UI**: `Dialog.Root`, `Dialog.Trigger`, `Dialog.Content`, `Dialog.Close`
- **Headless UI (Tailwind)**: `Menu`, `Menu.Button`, `Menu.Items`, `Menu.Item`
- **Ark UI**: `Accordion.Root`, `Accordion.Item`, `Accordion.Trigger`, `Accordion.Content`

이들 모두 Compound Components 패턴의 원리를 기반으로 한다.

---

## 6. TypeScript 적용 팁

### 6.1 Context 타입 정의

```tsx
interface ModalContextValue {
  open: boolean;
  onClose: () => void;
  defaultAction: (() => void) | null;
  registerDefaultAction: (action: () => void) => void;
}

const ModalContext = createContext<ModalContextValue | null>(null);

// null 체크 훅
function useModalContext() {
  const ctx = useContext(ModalContext);
  if (!ctx) {
    throw new Error("Modal 컴포넌트는 <Modal> 내부에서 사용해야 합니다.");
  }
  return ctx;
}
```

### 6.2 정적 속성 타입

```tsx
// Modal 컴포넌트 타입에 자식 컴포넌트를 명시적으로 추가
interface ModalComponent {
  (props: ModalProps): JSX.Element;
  Header: typeof Header;
  Title: typeof Title;
  CloseButton: typeof CloseButton;
  Body: typeof Body;
  Footer: typeof Footer;
  CancelButton: typeof CancelButton;
  ConfirmButton: typeof ConfirmButton;
}

const Modal = ModalRoot as ModalComponent;
Modal.Header = Header;
Modal.Title = Title;
// ...
```

---

## 7. 주의사항과 베스트 프랙티스

### 7.1 Context 성능

Context 값이 변경되면 **모든 소비자가 리렌더링**된다. 모달 열림/닫힘 같은 저빈도 이벤트는 괜찮지만, 입력 필드 같은 고빈도 상태는 별도 Context로 분리하자.

```tsx
// ❌ 모든 자식이 매 입력마다 리렌더링
<TabsContext.Provider value={{ activeTab, inputValue, setInputValue }}>

// ✅ 상태를 분리
<TabsActiveContext.Provider value={activeTab}>
  <TabsInputContext.Provider value={{ inputValue, setInputValue }}>
```

### 7.2 displayName 필수

`childrenArray` 분석이나 React DevTools에서 컴포넌트를 식별하려면 `displayName`을 설정해야 한다:

```tsx
CloseButton.displayName = "ModalCloseButton";
ConfirmButton.displayName = "ModalConfirmButton";
```

### 7.3 조건부 렌더링 주의

Compound Components 자식을 조건부로 렌더링하면 `React.Children.toArray` 결과가 달라질 수 있다. 이것은 의도된 동작이지만, `key`를 명시적으로 지정해야 React가 안정적으로 요소를 식별할 수 있다.

### 7.4 클론 vs 컨텍스트

과거에는 `React.cloneElement`로 자식에게 props를 주입하는 방식을 썼다:

```tsx
// ❌ 레거시 방식 — 불투명하고 디버깅이 어려움
React.Children.map(children, (child) => {
  if (React.isValidElement(child)) {
    return React.cloneElement(child, { onClose });
  }
  return child;
});
```

현재는 **Context API**를 사용하는 것이 권장된다:

```tsx
// ✅ 현재 권장 방식 — 명시적이고 타입 안전
<ModalContext.Provider value={{ onClose }}>
  {children}
</ModalContext.Provider>
```

---

## 8. 요약

| 특성 | 설명 |
|------|------|
| **정의** | 관련 컴포넌트들이 암묵적으로 상태를 공유하며 함께 작동하는 패턴 |
| **핵심 기술** | Context API + 정적 속성 (Object.assign) |
| **주요 장점** | 유연한 합성, 선언적 JSX, 관심사 분리, props drilling 감소 |
| **주요 단점** | Context 오용 시 성능 이슈, TypeScript 타입 정의 번거로움 |
| **실무 응용** | BaseModal + useModal + childrenArray 분석 → Enter/Esc 자동 처리 |
| **대표 라이브러리** | Radix UI, Headless UI, Ark UI |

> **핵심 인사이트**: Compound Components는 "어떻게 보일까"가 아니라 **"어떻게 합성할까"**에 집중하게 만드는 패턴이다. 컴포넌트의 내부 구현을 캡슐화하면서도, 사용자에게는 레고 블록처럼 자유로운 조립을 허용한다. 회사 프로젝트의 BaseModal + useModal 패턴은 이 원리를 실전에 적용한 훌륭한 사례다.