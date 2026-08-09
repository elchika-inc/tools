import { DiffDisplay } from '@components/DiffDisplay';
import { Header } from '@components/Header';
import { SettingsPanel } from '@components/SettingsPanel';
import { TextInputPanel } from '@components/TextInputPanel';
import { useDiffState } from '@hooks/useDiffState';
import { ToastToaster } from "@/components/ui/toast";

export function App() {
  const {
    originalText,
    modifiedText,
    viewMode,
    language,
    ignoreOptions,
    diffResult,
    setOriginalText,
    setModifiedText,
    setViewMode,
    setLanguage,
    updateIgnoreOptions,
    clearAll,
  } = useDiffState();

  const handleFileLoad = (text: string, target: 'original' | 'modified') => {
    if (target === 'original') {
      setOriginalText(text);
    } else {
      setModifiedText(text);
    }
  };

  return <ToastToaster>
  <>

        <div className="min-h-screen bg-background">
          <Header />
          <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
            <div className="space-y-6">
              {/* テキスト入力パネル */}
              <TextInputPanel
                originalText={originalText}
                modifiedText={modifiedText}
                onOriginalTextChange={setOriginalText}
                onModifiedTextChange={setModifiedText}
                onFileLoad={handleFileLoad}
              />

              {/* メインコンテンツ: 差分表示 + 設定パネル */}
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_400px]">
                <DiffDisplay diffResult={diffResult} viewMode={viewMode} language={language} />
                <SettingsPanel
                  viewMode={viewMode}
                  language={language}
                  ignoreOptions={ignoreOptions}
                  diffResult={diffResult}
                  onViewModeChange={setViewMode}
                  onLanguageChange={setLanguage}
                  onIgnoreOptionsChange={updateIgnoreOptions}
                  onClearAll={clearAll}
                />
              </div>
            </div>
          </main>
        </div>
      </>
  </ToastToaster>;
}
