import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Alert, SafeAreaView, ScrollView, Dimensions, Platform } from 'react-native';
import { StatusBar } from 'expo-status-bar';

// スマホ実機用（Webビルド時にエラーにならないようPlatformで切り替えて使用）
import { WebView } from 'react-native-webview';

// 各種データのインポート
import { STAGES, Stage } from './stages';
import { TUTORIAL_HTML } from './tutorialHtml'; // 💡 HTML文字列をインポート

const { width: SCREEN_WIDTH } = Dimensions.get('window');
type CellState = 0 | 1 | 2;
type PlayMode = 'fill' | 'cross';
type ScreenMode = 'menu' | 'game' | 'tutorial';

const shuffleArray = (array: Stage[]): Stage[] => {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
};

export default function App() {
  const [screen, setScreen] = useState<ScreenMode>('menu');
  const [shuffledStages, setShuffledStages] = useState<Stage[]>([]);
  const [currentStageIndex, setCurrentStageIndex] = useState(0);
  const [playMode, setPlayMode] = useState<PlayMode>('fill');
  const [board, setBoard] = useState<CellState[][]>([]);
  const [isCleared, setIsCleared] = useState(false);

  const stage = shuffledStages[currentStageIndex];
  
  const stageGrid = stage ? stage.pattern.map(row => 
    row.split('').map(char => char === '#' ? 1 : 0)
  ) : [];

  const numRows = stageGrid.length;
  const numCols = stageGrid[0] ? stageGrid[0].length : 0;

  const handleSelectSize = (size: 5 | 8 | 10) => {
    const filtered = STAGES.filter(s => s.size === size);
    const shuffled = shuffleArray(filtered);
    
    setShuffledStages(shuffled);
    setCurrentStageIndex(0);
    setIsCleared(false);
    setPlayMode('fill');
    
    const firstGrid = shuffled[0].pattern.map(row => row.split('').map(char => char === '#' ? 1 : 0));
    const initialBoard = Array(firstGrid.length)
      .fill(null)
      .map(() => Array(firstGrid[0].length).fill(0));
    setBoard(initialBoard);
    
    setScreen('game');
  };

  const initGame = (stageIndex: number, currentList: Stage[]) => {
    const targetStage = currentList[stageIndex];
    if (!targetStage) return;

    const sGrid = targetStage.pattern.map(row => row.split('').map(char => char === '#' ? 1 : 0));
    const initialBoard = Array(sGrid.length)
      .fill(null)
      .map(() => Array(sGrid[0].length).fill(0));
    
    setBoard(initialBoard);
    setIsCleared(false);
    setCurrentStageIndex(stageIndex);
  };

  const getRowHints = (grid: number[][]) => {
    return grid.map((row) => {
      const hints: number[] = [];
      let count = 0;
      row.forEach((cell) => {
        if (cell === 1) count++;
        else if (count > 0) { hints.push(count); count = 0; }
      });
      if (count > 0) hints.push(count);
      return hints.length === 0 ? [0] : hints;
    });
  };

  const getColHints = (grid: number[][]) => {
    const colHints: number[][] = [];
    const width = grid[0] ? grid[0].length : 0;
    for (let c = 0; c < width; c++) {
      const hints: number[] = [];
      let count = 0;
      for (let r = 0; r < grid.length; r++) {
        if (grid[r][c] === 1) count++;
        else if (count > 0) { hints.push(count); count = 0; }
      }
      if (count > 0) hints.push(count);
      colHints.push(hints.length === 0 ? [0] : hints);
    }
    return colHints;
  };

  const rowHints = getRowHints(stageGrid);
  const colHints = getColHints(stageGrid);

  const maxRowHintsLength = rowHints.length > 0 ? Math.max(...rowHints.map((h) => h.length)) : 1;
  const maxColHintsHeight = colHints.length > 0 ? Math.max(...colHints.map((h) => h.length)) : 1;

  const hintAreaWidth = maxRowHintsLength * 16 + 10;
  const paddingOffset = 50;
  const availableWidth = SCREEN_WIDTH - paddingOffset - hintAreaWidth;
  const cellSize = numCols > 0 ? Math.min(44, Math.floor(availableWidth / numCols)) : 30;

  const handleCellPress = (r: number, c: number) => {
    if (isCleared) return;
    const newBoard = board.map((row) => [...row]);
    const currentVal = board[r][c];

    if (playMode === 'fill') {
      newBoard[r][c] = currentVal === 1 ? 0 : 1;
    } else {
      newBoard[r][c] = currentVal === 2 ? 0 : 2;
    }
    setBoard(newBoard);
    checkClear(newBoard);
  };

  const checkClear = (currentBoard: CellState[][]) => {
    let clear = true;
    for (let r = 0; r < numRows; r++) {
      for (let c = 0; c < numCols; c++) {
        const target = stageGrid[r][c];
        const player = currentBoard[r][c];
        if ((player === 1) !== (target === 1)) {
          clear = false;
          break;
        }
      }
      if (!clear) break;
    }

    if (clear) {
      setIsCleared(true);
      const isLastStage = currentStageIndex === shuffledStages.length - 1;

      Alert.alert(
        '🎉 クリア！', 
        isLastStage 
          ? `最終問題をクリアしました！全問制覇おめでとうございます！`
          : `『${stage.name}』を完成させました！ (残り ${shuffledStages.length - 1 - currentStageIndex} 問)`, 
        [
          {
            text: isLastStage ? 'メニューへ戻る' : '次の問題へ',
            onPress: () => {
              if (isLastStage) {
                setScreen('menu');
              } else {
                initGame(currentStageIndex + 1, shuffledStages);
              }
            },
          },
          { text: '閉じる' },
        ]
      );
    }
  };

  // --- 説明画面（チュートリアル）の描画 ---
  if (screen === 'tutorial') {
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar style="light" />
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => setScreen('menu')}>
            <Text style={styles.backButtonText}>◀ メニュー</Text>
          </TouchableOpacity>
          <View style={styles.headerTitleArea}>
            <Text style={styles.title}>遊び方・ルール</Text>
          </View>
          <View style={{ width: 60 }} />
        </View>
        
        {/* 💡 ハイブリッド表示：WebブラウザならネイティブHTMLタグ、スマホ実機ならWebViewで表示 */}
        {Platform.OS === 'web' ? (
          <ScrollView style={styles.webContainer}>
            <div 
              style={{ padding: 10 }}
              dangerouslySetInnerHTML={{ __html: TUTORIAL_HTML }} 
            />
          </ScrollView>
        ) : (
          <WebView 
            source={{ html: TUTORIAL_HTML }} 
            style={styles.webView}
            originWhitelist={['*']}
          />
        )}
      </SafeAreaView>
    );
  }

  // --- メニュー画面の描画 ---
  if (screen === 'menu') {
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar style="light" />
        <View style={styles.menuContainer}>
          <Text style={styles.menuTitle}>Pixel Picross</Text>
          <Text style={styles.menuSubtitle}>サイズを選んでスタート（全問ランダム出題）</Text>

          <View style={styles.menuButtons}>
            <TouchableOpacity style={[styles.sizeButton, {backgroundColor: '#10b981'}]} onPress={() => handleSelectSize(5)}>
              <Text style={styles.sizeButtonText}>かんたん (5 × 5)</Text>
              <Text style={styles.sizeButtonSub}>全12問 / サクッと遊べる</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.sizeButton, {backgroundColor: '#f59e0b'}]} onPress={() => handleSelectSize(8)}>
              <Text style={styles.sizeButtonText}>ふつう (8 × 8)</Text>
              <Text style={styles.sizeButtonSub}>全13問 / ちょっと手応え</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.sizeButton, {backgroundColor: '#ef4444'}]} onPress={() => handleSelectSize(10)}>
              <Text style={styles.sizeButtonText}>むずかしい (10 × 10)</Text>
              <Text style={styles.sizeButtonSub}>全13問 / じっくり挑戦</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.tutorialButton} onPress={() => setScreen('tutorial')}>
            <Text style={styles.tutorialButtonText}>❓ 遊び方・ルールを見る</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  if (!stage || board.length === 0 || board.length !== numRows || board[0].length !== numCols) return null;

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="light" />
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => setScreen('menu')}>
          <Text style={styles.backButtonText}>◀ メニュー</Text>
        </TouchableOpacity>
        <View style={styles.headerTitleArea}>
          <Text style={styles.title}>Pixel Picross</Text>
          <Text style={styles.subtitle}>第 {currentStageIndex + 1} / {shuffledStages.length} 問目</Text>
        </View>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.stageSelector}>
          <Text style={styles.stageTitle}>{isCleared ? stage.name : '？？？'}</Text>
          <View style={styles.stageButtons}>
            <TouchableOpacity style={styles.navButton} onPress={() => initGame(currentStageIndex, shuffledStages)}>
              <Text style={styles.buttonText}>リセット</Text>
            </TouchableOpacity>
            {currentStageIndex < shuffledStages.length - 1 && (
              <TouchableOpacity style={styles.navButton} onPress={() => initGame(currentStageIndex + 1, shuffledStages)}>
                <Text style={styles.buttonText}>スキップ ▶</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        <View style={styles.gameArea}>
          <View style={styles.colHintsRow}>
            <View style={{ width: hintAreaWidth }} />
            <View style={styles.colHintsContainer}>
              {colHints.map((hints, c) => (
                <View key={c} style={[styles.colHintCol, { width: cellSize }]}>
                  {Array(maxColHintsHeight - hints.length).fill(null).map((_, i) => (
                    <View key={`pad-${i}`} style={styles.hintCell} />
                  ))}
                  {hints.map((hint, i) => (
                    <View key={i} style={styles.hintCell}>
                      <Text style={styles.hintText}>{hint}</Text>
                    </View>
                  ))}
                </View>
              ))}
            </View>
          </View>

          <View style={styles.boardWithRowHints}>
            <View style={[styles.rowHintsContainer, { width: hintAreaWidth }]}>
              {rowHints.map((hints, r) => (
                <View key={r} style={[styles.rowHintRow, { height: cellSize }]}>
                  {Array(maxRowHintsLength - hints.length).fill(null).map((_, i) => (
                    <View key={`pad-${i}`} style={styles.hintCell} />
                  ))}
                  {hints.map((hint, i) => (
                    <View key={i} style={styles.hintCell}>
                      <Text style={styles.hintText}>{hint}</Text>
                    </View>
                  ))}
                </View>
              ))}
            </View>

            <View style={styles.grid}>
              {board.map((row, r) => (
                <View key={r} style={styles.gridRow}>
                  {row.map((cell, c) => (
                    <TouchableOpacity
                      key={c}
                      style={[
                        styles.cell,
                        { width: cellSize, height: cellSize },
                        cell === 1 && styles.cellFilled,
                        cell === 2 && styles.cellCross,
                        isCleared && styles.cellCleared,
                      ]}
                      activeOpacity={0.7}
                      onPress={() => handleCellPress(r, c)}
                    >
                      {cell === 2 && (
                        <Text style={[styles.crossText, { fontSize: cellSize * 0.5 }]}>×</Text>
                      )}
                    </TouchableOpacity>
                  ))}
                </View>
              ))}
            </View>
          </View>
        </View>

        <View style={styles.controls}>
          <TouchableOpacity
            style={[styles.modeButton, playMode === 'fill' && styles.modeButtonActive]}
            onPress={() => setPlayMode('fill')}
          >
            <Text style={[styles.modeButtonText, playMode === 'fill' && styles.modeButtonTextActive]}>
              ⬛ 塗る
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.modeButton, playMode === 'cross' && styles.modeButtonActive]}
            onPress={() => setPlayMode('cross')}
          >
            <Text style={[styles.modeButtonText, playMode === 'cross' && styles.modeButtonTextActive]}>
              ❌ バツ
            </Text>
          </TouchableOpacity>
        </View>

        {isCleared && (
          <View style={styles.clearBanner}>
            <Text style={styles.clearText}>🎉 STAGE CLEAR! 🎉</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#1e293b',
  },
  menuContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 40,
  },
  menuTitle: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#38bdf8',
    marginBottom: 10,
    letterSpacing: 2,
  },
  menuSubtitle: {
    fontSize: 14,
    color: '#94a3b8',
    marginBottom: 40,
    textAlign: 'center',
  },
  menuButtons: {
    width: '100%',
    maxWidth: 320,
  },
  sizeButton: {
    paddingVertical: 18,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  sizeButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  sizeButtonSub: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 11,
    marginTop: 4,
  },
  tutorialButton: {
    marginTop: 30,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: '#475569',
    backgroundColor: 'transparent',
  },
  tutorialButtonText: {
    color: '#94a3b8',
    fontSize: 14,
    fontWeight: '600',
  },
  webView: {
    flex: 1,
    backgroundColor: '#1e293b',
  },
  // Webブラウザ表示用のコンテナ
  webContainer: {
    flex: 1,
    backgroundColor: '#1e293b',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 10,
    paddingBottom: 10,
    paddingHorizontal: 10,
    backgroundColor: '#0f172a',
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
  },
  backButton: {
    backgroundColor: '#334155',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  backButtonText: {
    color: '#f8fafc',
    fontSize: 12,
    fontWeight: 'bold',
  },
  headerTitleArea: {
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#38bdf8',
  },
  subtitle: {
    fontSize: 12,
    color: '#94a3b8',
    marginTop: 2,
  },
  container: {
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 10,
  },
  stageSelector: {
    width: '100%',
    maxWidth: 320,
    backgroundColor: '#334155',
    borderRadius: 12,
    padding: 12,
    marginBottom: 15,
    alignItems: 'center',
  },
  stageTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#f8fafc',
    marginBottom: 8,
  },
  stageButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    width: '100%',
  },
  navButton: {
    flex: 1,
    backgroundColor: '#475569',
    paddingVertical: 6,
    marginHorizontal: 4,
    borderRadius: 6,
    alignItems: 'center',
  },
  buttonText: {
    color: '#f8fafc',
    fontSize: 13,
    fontWeight: '600',
  },
  gameArea: {
    backgroundColor: '#0f172a',
    padding: 15,
    borderRadius: 16,
    marginBottom: 15,
  },
  colHintsRow: {
    flexDirection: 'row',
  },
  colHintsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  colHintCol: {
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginHorizontal: 0.5,
  },
  rowHintsContainer: {
    justifyContent: 'center',
    alignItems: 'flex-end',
    paddingRight: 6,
  },
  rowHintRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginVertical: 0.5,
  },
  hintCell: {
    width: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  hintText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#94a3b8',
    textAlign: 'center',
  },
  boardWithRowHints: {
    flexDirection: 'row',
    marginTop: 4,
  },
  grid: {
    borderWidth: 2,
    borderColor: '#475569',
    backgroundColor: '#1e293b',
  },
  gridRow: {
    flexDirection: 'row',
  },
  cell: {
    borderWidth: 1,
    borderColor: '#334155',
    backgroundColor: '#1e293b',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cellFilled: {
    backgroundColor: '#38bdf8',
  },
  cellCross: {
    backgroundColor: '#1e293b',
  },
  crossText: {
    color: '#ef4444',
    fontWeight: 'bold',
  },
  cellCleared: {
    opacity: 0.9,
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'center',
    width: '100%',
    maxWidth: 320,
    marginBottom: 15,
  },
  modeButton: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#334155',
    paddingVertical: 12,
    marginHorizontal: 6,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#475569',
  },
  modeButtonActive: {
    backgroundColor: '#0284c7',
    borderColor: '#38bdf8',
  },
  modeButtonText: {
    color: '#94a3b8',
    fontSize: 16,
    fontWeight: 'bold',
  },
  modeButtonTextActive: {
    color: '#f8fafc',
  },
  clearBanner: {
    width: '100%',
    maxWidth: 320,
    backgroundColor: '#10b981',
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
  },
  clearText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
    letterSpacing: 1.5,
  },
});
