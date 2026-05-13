"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useCallback,
  useState,
} from "react";

/* ------------------------------------------------------------------
 *  1. Context: 모든 자식이 공유하는 상태
 * ------------------------------------------------------------------ */
interface ModalContextValue {
  open: boolean;
  onClose: () => void;
  /** childrenArray에서 찾은 ConfirmButton의 onConfirm */
  defaultAction: (() => void) | null;
  registerDefaultAction: (action: () => void) => void;
}

const ModalContext = createContext<ModalContextValue | null>(null);

function useModalContext() {
  const ctx = useContext(ModalContext);
  if (!ctx) throw new Error("Modal 컴포넌트는 <Modal> 내부에서 사용해야 합니다.");
  return ctx;
}

/* ------------------------------------------------------------------
 *  2. useModal 훅: 모달 열/닫 상태 + childrenArray 분석
 *     — 실무 BaseModal + useModal 패턴의 핵심 로직
 * ------------------------------------------------------------------ */
export function useModal(initialOpen = false) {
  const [open, setOpen] = useState(initialOpen);
  const openModal = useCallback(() => setOpen(true), []);
  const closeModal = useCallback(() => setOpen(false), []);

  /**
   * childrenArray 분석 함수
   * — React.Children.toArray 로 자식을 순회하며
   *   포커스 가능한 요소, 기본 액션(ConfirmButton)을 찾습니다.
   */
  const analyzeChildren = useCallback(
    (children: React.ReactNode) => {
      const childrenArray = React.Children.toArray(children);

      const focusableElements: React.ReactElement[] = [];
      let defaultAction: (() => void) | null = null;

      childrenArray.forEach((child) => {
        if (!React.isValidElement(child)) return;

        // 자식의 type이 함수(컴포넌트)인 경우 이름 확인
        const childType = child.type as React.ComponentType & { displayName?: string };

        // ConfirmButton 찾기 → Enter 키 기본 액션으로 등록
        if (childType?.displayName === "ModalConfirmButton") {
          defaultAction = (child.props as { onConfirm?: () => void }).onConfirm ?? null;
        }

        // Footer 안의 자식들도 재귀적으로 분석
        if (childType?.displayName === "ModalFooter" && (child.props as { children?: React.ReactNode }).children) {
          const footerChildren = React.Children.toArray((child.props as { children?: React.ReactNode }).children);
          footerChildren.forEach((footerChild) => {
            if (!React.isValidElement(footerChild)) return;
            const fc = footerChild.type as React.ComponentType & { displayName?: string };
            if (fc?.displayName === "ModalConfirmButton") {
              defaultAction =
                (footerChild.props as { onConfirm?: () => void }).onConfirm ?? null;
            }
          });
        }

        // 포커스 가능한 요소 수집 (버튼, 입력 등)
        if (
          typeof childType === "string" &&
          ["button", "a", "input", "textarea", "select"].includes(childType)
        ) {
          focusableElements.push(child);
        }
      });

      return { focusableElements, defaultAction };
    },
    []
  );

  return { open, openModal, closeModal, analyzeChildren };
}

/* ------------------------------------------------------------------
 *  3. Modal (Root) — BaseModal 역할
 *     — 오버레이, 포커스 트랩, Esc/Enter 키 처리
 * ------------------------------------------------------------------ */
interface ModalProps {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

export default function Modal({ open, onClose, children }: ModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const [defaultAction, setDefaultAction] = useState<(() => void) | null>(null);

  // BaseModal: Context에 상태 제공
  const contextValue = React.useMemo(
    () => ({
      open,
      onClose,
      defaultAction,
      registerDefaultAction: (action: () => void) => setDefaultAction(action),
    }),
    [open, onClose, defaultAction]
  );

  // BaseModal: Esc 키 처리
  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      }
      // Enter 키 → childrenArray에서 찾은 ConfirmButton의 onConfirm 실행
      if (e.key === "Enter") {
        e.preventDefault();
        defaultAction?.();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose, defaultAction]);

  // BaseModal: 포커스 트랩 & 바디 스크롤 잠금
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
      modalRef.current?.focus();
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  if (!open) return null;

  return (
    <ModalContext.Provider value={contextValue}>
      {/* 오버레이 — BaseModal이 렌더링 */}
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-[fadeIn_0.2s_ease-out]"
        onClick={(e) => {
          if (e.target === e.currentTarget) onClose();
        }}
      >
        <div
          ref={modalRef}
          role="dialog"
          aria-modal="true"
          tabIndex={-1}
          className="bg-slate-800 border border-slate-600 rounded-2xl shadow-2xl w-full max-w-md mx-4 animate-[slideUp_0.3s_ease-out]"
        >
          {children}
        </div>
      </div>
    </ModalContext.Provider>
  );
}

/* ------------------------------------------------------------------
 *  4. Modal.Header — 컴파운드 자식 컴포넌트
 * ------------------------------------------------------------------ */
function Header({ children }: { children: React.ReactNode }) {
  return <div className="flex items-center justify-between px-6 pt-5 pb-2">{children}</div>;
}
Header.displayName = "ModalHeader";

/* ------------------------------------------------------------------
 *  5. Modal.Title
 * ------------------------------------------------------------------ */
function Title({ children }: { children: React.ReactNode }) {
  return <h2 className="text-xl font-bold text-white">{children}</h2>;
}
Title.displayName = "ModalTitle";

/* ------------------------------------------------------------------
 *  6. Modal.CloseButton
 * ------------------------------------------------------------------ */
function CloseButton() {
  const { onClose } = useModalContext();
  return (
    <button
      onClick={onClose}
      className="text-slate-400 hover:text-white transition-colors p-1 rounded-lg hover:bg-slate-700"
      aria-label="닫기"
    >
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M6 6l8 8M14 6l-8 8" />
      </svg>
    </button>
  );
}
CloseButton.displayName = "ModalCloseButton";

/* ------------------------------------------------------------------
 *  7. Modal.Body
 * ------------------------------------------------------------------ */
function Body({ children }: { children: React.ReactNode }) {
  return <div className="px-6 py-4 text-slate-300">{children}</div>;
}
Body.displayName = "ModalBody";

/* ------------------------------------------------------------------
 *  8. Modal.Footer
 * ------------------------------------------------------------------ */
function Footer({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-end gap-3 px-6 pb-5 pt-2">
      {children}
    </div>
  );
}
Footer.displayName = "ModalFooter";

/* ------------------------------------------------------------------
 *  9. Modal.CancelButton
 * ------------------------------------------------------------------ */
function CancelButton({ children }: { children: React.ReactNode }) {
  const { onClose } = useModalContext();
  return (
    <button
      onClick={onClose}
      className="px-4 py-2 text-sm rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-300 transition-colors"
    >
      {children}
    </button>
  );
}
CancelButton.displayName = "ModalCancelButton";

/* ------------------------------------------------------------------
 *  10. Modal.ConfirmButton — childrenArray에서 자동 식별되는 대상
 * ------------------------------------------------------------------ */
interface ConfirmButtonProps {
  children: React.ReactNode;
  onConfirm: () => void;
}

function ConfirmButton({ children, onConfirm }: ConfirmButtonProps) {
  const { registerDefaultAction } = useModalContext();

  // 이 버튼이 기본 액션(Enter)으로 등록
  useEffect(() => {
    registerDefaultAction(onConfirm);
  }, [onConfirm, registerDefaultAction]);

  return (
    <button
      onClick={onConfirm}
      className="px-4 py-2 text-sm rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-medium transition-colors"
    >
      {children}
    </button>
  );
}
ConfirmButton.displayName = "ModalConfirmButton";

/* ------------------------------------------------------------------
 *  정적 속성으로 합성 (Compound Components 핵심)
 * ------------------------------------------------------------------ */
Modal.Header = Header;
Modal.Title = Title;
Modal.CloseButton = CloseButton;
Modal.Body = Body;
Modal.Footer = Footer;
Modal.CancelButton = CancelButton;
Modal.ConfirmButton = ConfirmButton;