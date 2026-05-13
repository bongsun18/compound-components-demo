"use client";

import Modal from "@/components/Modal";
import Accordion from "@/components/Accordion";
import Tabs from "@/components/Tabs";
import Card from "@/components/Card";
import { useState } from "react";

export default function Home() {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      {/* Hero */}
      <header className="pt-16 pb-12 px-4 text-center">
        <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-4">
          🧩 Compound Components
        </h1>
        <p className="text-slate-400 text-lg max-w-2xl mx-auto">
          React의 Compound Components 패턴 — 유연하고 선언적인 컴포넌트 설계를
          배워봅시다.
        </p>
      </header>

      {/* Sections */}
      <main className="max-w-4xl mx-auto px-4 pb-24 space-y-20">
        {/* 1. Modal — BaseModal + useModal 스타일 */}
        <section id="modal">
          <div className="flex items-center gap-3 mb-6">
            <span className="text-3xl">🪟</span>
            <div>
              <h2 className="text-2xl font-bold">Modal</h2>
              <p className="text-slate-400 text-sm">
                BaseModal + useModal + childrenArray 분석 → Enter/Esc 지원
              </p>
            </div>
          </div>

          <div className="bg-slate-800/60 rounded-2xl p-6 border border-slate-700">
            <p className="text-slate-300 mb-4">
              <strong>BaseModal</strong>은 모달의 기본 뼈대(오버레이, 포커스 트랩,
              Esc 키)를 제공하고, <strong>useModal</strong> 훅으로 열고 닫기를
              제어합니다. children을 분석해 포커스 가능한 요소를 찾고 Enter 키로
              기본 액션을 실행합니다.
            </p>
            <button
              onClick={() => setModalOpen(true)}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 rounded-lg font-medium transition-colors"
            >
              모달 열기
            </button>

            <Modal open={modalOpen} onClose={() => setModalOpen(false)}>
              <Modal.Header>
                <Modal.Title>Compound Modal 🎉</Modal.Title>
                <Modal.CloseButton />
              </Modal.Header>
              <Modal.Body>
                <p>
                  이 모달은 <code className="text-blue-300">BaseModal</code>을
                  기반으로 만들어졌습니다.
                </p>
                <p className="mt-2 text-slate-400 text-sm">
                  ✅ Esc 키로 닫기 &nbsp; ✅ Enter 키로 확인 &nbsp; ✅ 오버레이
                  클릭으로 닫기
                </p>
              </Modal.Body>
              <Modal.Footer>
                <Modal.CancelButton>취소</Modal.CancelButton>
                <Modal.ConfirmButton onConfirm={() => setModalOpen(false)}>
                  확인
                </Modal.ConfirmButton>
              </Modal.Footer>
            </Modal>
          </div>

          <details className="mt-4 bg-slate-800/40 rounded-xl border border-slate-700 overflow-hidden">
            <summary className="px-4 py-3 cursor-pointer text-slate-300 hover:text-white font-medium">
              💡 핵심 원리 보기
            </summary>
            <div className="px-4 pb-4 text-slate-400 text-sm space-y-2">
              <p>
                <strong>1. BaseModal (공통 뼈대)</strong>: 오버레이 렌더링, 포커스
                트랩, Esc 키 처리, 접근성 속성을 담당합니다.
              </p>
              <p>
                <strong>2. useModal 훅</strong>:{" "}
                <code>open/close/onClose</code> 상태와 핸들러를 관리합니다.
                childrenArray를 분석해 포커스 가능한 요소를 찾습니다.
              </p>
              <p>
                <strong>3. childrenArray 분석</strong>:{" "}
                <code>React.Children.toArray(children)</code>로 자식 요소를
                순회하며, 각 자식의 <code>type</code>과 <code>props</code>를
                검사합니다. 이를 통해 ConfirmButton을 자동으로 식별하고 Enter 키
                액션에 연결합니다.
              </p>
              <p>
                <strong>4. Enter/Esc 처리</strong>: Esc는 BaseModal이 처리하고,
                Enter는 childrenArray에서 찾은 ConfirmButton의 onConfirm을
                실행합니다.
              </p>
            </div>
          </details>
        </section>

        {/* 2. Accordion */}
        <section id="accordion">
          <div className="flex items-center gap-3 mb-6">
            <span className="text-3xl">🪗</span>
            <div>
              <h2 className="text-2xl font-bold">Accordion</h2>
              <p className="text-slate-400 text-sm">
                공개 상태를 부모가 관리하는 선언적 아코디언
              </p>
            </div>
          </div>

          <div className="bg-slate-800/60 rounded-2xl p-6 border border-slate-700">
            <Accordion>
              <Accordion.Item value="react">
                <Accordion.Trigger>React란?</Accordion.Trigger>
                <Accordion.Content>
                  React는 Facebook에서 개발한 선언적 UI 라이브러리입니다.
                  컴포넌트 기반 아키텍처로 재사용 가능한 UI를 만들 수 있습니다.
                </Accordion.Content>
              </Accordion.Item>
              <Accordion.Item value="compound">
                <Accordion.Trigger>
                  Compound Components란?
                </Accordion.Trigger>
                <Accordion.Content>
                  Compound Components는 하나의 부모 컴포넌트와 여러 개의 자식
                  컴포넌트가 암묵적으로 상태를 공유하는 패턴입니다.{" "}
                  <code>&lt;select&gt;</code>와 <code>&lt;option&gt;</code>의
                  관계와 유사합니다.
                </Accordion.Content>
              </Accordion.Item>
              <Accordion.Item value="flexibility">
                <Accordion.Trigger>왜 유연한가?</Accordion.Trigger>
                <Accordion.Content>
                  사용자가 자식 컴포넌트의 순서, 렌더링 여부, 추가 마크업을
                  자유롭게 결정할 수 있습니다. 내부 상태는 Context로 공유되므로
                  props drilling이 필요 없습니다.
                </Accordion.Content>
              </Accordion.Item>
            </Accordion>
          </div>

          <details className="mt-4 bg-slate-800/40 rounded-xl border border-slate-700 overflow-hidden">
            <summary className="px-4 py-3 cursor-pointer text-slate-300 hover:text-white font-medium">
              💡 핵심 원리 보기
            </summary>
            <div className="px-4 pb-4 text-slate-400 text-sm space-y-2">
              <p>
                <strong>Context API</strong>: Accordion.Root가
                AccordionContext.Provider로 상태를 제공하고, 각 Item/Trigger/Content가
                useContext로 소비합니다.
              </p>
              <p>
                <strong>선언적 합성</strong>:{" "}
                <code>&lt;Accordion.Item value="..."&gt;</code>처럼 value prop으로
                식별하며, 부모 컴포넌트가 어떤 항목이 열려 있는지 관리합니다.
              </p>
            </div>
          </details>
        </section>

        {/* 3. Tabs */}
        <section id="tabs">
          <div className="flex items-center gap-3 mb-6">
            <span className="text-3xl">📑</span>
            <div>
              <h2 className="text-2xl font-bold">Tabs</h2>
              <p className="text-slate-400 text-sm">
                Context로 활성 탭을 공유하는 탭 컴포넌트
              </p>
            </div>
          </div>

          <div className="bg-slate-800/60 rounded-2xl p-6 border border-slate-700">
            <Tabs defaultValue="overview">
              <Tabs.List>
                <Tabs.Trigger value="overview">개요</Tabs.Trigger>
                <Tabs.Trigger value="usage">사용법</Tabs.Trigger>
                <Tabs.Trigger value="tradeoffs">장단점</Tabs.Trigger>
              </Tabs.List>
              <Tabs.Content value="overview">
                <h3 className="text-lg font-semibold mb-2">
                  Compound Components 개요
                </h3>
                <p>
                  Compound Components 패턴은 관련된 컴포넌트들이 함께 작동하면서도
                  각각 독립적으로 사용 가능한 구조를 만듭니다. HTML의{" "}
                  <code>&lt;select&gt;</code> + <code>&lt;option&gt;</code>,{" "}
                  <code>&lt;table&gt;</code> + <code>&lt;tr&gt;</code> +{" "}
                  <code>&lt;td&gt;</code>가 대표적인 예입니다.
                </p>
              </Tabs.Content>
              <Tabs.Content value="usage">
                <h3 className="text-lg font-semibold mb-2">사용법</h3>
                <ul className="list-disc list-inside space-y-1 text-slate-300">
                  <li>부모 컴포넌트가 Context Provider로 상태 제공</li>
                  <li>자식 컴포넌트가 useContext로 상태 소비</li>
                  <li>사용자는 JSX 합성으로 자유롭게 구성</li>
                  <li>childrenArray로 동적 분석 및 제어 가능</li>
                </ul>
              </Tabs.Content>
              <Tabs.Content value="tradeoffs">
                <h3 className="text-lg font-semibold mb-2">장단점</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-green-400 font-medium">✅ 장점</p>
                    <ul className="text-slate-300 text-sm space-y-1 mt-1">
                      <li>유연한 합성 (Composition)</li>
                      <li>props drilling 감소</li>
                      <li>관심사의 분리</li>
                      <li>자연스러운 JSX</li>
                    </ul>
                  </div>
                  <div>
                    <p className="text-red-400 font-medium">❌ 단점</p>
                    <ul className="text-slate-300 text-sm space-y-1 mt-1">
                      <li>Context 오용 시 성능 이슈</li>
                      <li>디버깅 복잡도 증가</li>
                      <li>TypeScript 타입 정의 번거로움</li>
                      <li>학습 곡선</li>
                    </ul>
                  </div>
                </div>
              </Tabs.Content>
            </Tabs>
          </div>
        </section>

        {/* 4. Card */}
        <section id="card">
          <div className="flex items-center gap-3 mb-6">
            <span className="text-3xl">🃏</span>
            <div>
              <h2 className="text-2xl font-bold">Card</h2>
              <p className="text-slate-400 text-sm">
                가장 단순한 Compound Components 예제
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <Card.Image
                src="https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=400&h=200&fit=crop"
                alt="코드"
              />
              <Card.Header>
                <Card.Title>React Compound Components</Card.Title>
                <Card.Description>
                  선언적이고 유연한 컴포넌트 설계 패턴
                </Card.Description>
              </Card.Header>
              <Card.Footer>
                <Card.Action>자세히 보기 →</Card.Action>
              </Card.Footer>
            </Card>

            <Card>
              <Card.Header>
                <Card.Title>Context API의 힘</Card.Title>
                <Card.Description>
                  부모-자식 간 암묵적 상태 공유
                </Card.Description>
              </Card.Header>
              <Card.Footer>
                <Card.Action>더 알아보기 →</Card.Action>
              </Card.Footer>
            </Card>
          </div>
        </section>

        {/* Pattern Comparison */}
        <section id="comparison">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            ⚖️ 패턴 비교
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm border border-slate-700 rounded-xl overflow-hidden">
              <thead className="bg-slate-800">
                <tr>
                  <th className="px-4 py-3 text-left text-slate-300">
                    패턴
                  </th>
                  <th className="px-4 py-3 text-left text-slate-300">
                    유연성
                  </th>
                  <th className="px-4 py-3 text-left text-slate-300">
                    복잡도
                  </th>
                  <th className="px-4 py-3 text-left text-slate-300">
                    대표 예시
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700">
                <tr className="hover:bg-slate-800/50">
                  <td className="px-4 py-3 font-medium">Props Drilling</td>
                  <td className="px-4 py-3">⭐</td>
                  <td className="px-4 py-3">낮음</td>
                  <td className="px-4 py-3 text-slate-400">
                    {'<Modal isOpen={...} onClose={...} title={...} />'}
                  </td>
                </tr>
                <tr className="hover:bg-slate-800/50 bg-blue-500/10">
                  <td className="px-4 py-3 font-medium text-blue-400">
                    Compound Components
                  </td>
                  <td className="px-4 py-3">⭐⭐⭐</td>
                  <td className="px-4 py-3">중간</td>
                  <td className="px-4 py-3 text-slate-400">
                    {'<Modal><Modal.Header>...</Modal>'}
                  </td>
                </tr>
                <tr className="hover:bg-slate-800/50">
                  <td className="px-4 py-3 font-medium">Render Props</td>
                  <td className="px-4 py-3">⭐⭐⭐</td>
                  <td className="px-4 py-3">중간</td>
                  <td className="px-4 py-3 text-slate-400">
                    {'<Modal render={({ close }) => ...} />'}
                  </td>
                </tr>
                <tr className="hover:bg-slate-800/50">
                  <td className="px-4 py-3 font-medium">Headless UI</td>
                  <td className="px-4 py-3">⭐⭐⭐⭐</td>
                  <td className="px-4 py-3">높음</td>
                  <td className="px-4 py-3 text-slate-400">
                    Radix, Headless UI, Ark UI
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800 py-8 text-center text-slate-500 text-sm">
        <p>
          Compound Components Demo — React Pattern Study
        </p>
      </footer>
    </div>
  );
}