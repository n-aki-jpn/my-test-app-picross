import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Alert, SafeAreaView, ScrollView, Dimensions } from 'react-native';
import { StatusBar } from 'expo-status-bar';

// 💡 外出ししたステージデータをインポート
import { STAGES } from './stages';

// 画面の横幅を取得
const { width: SCREEN_WIDTH } = Dimensions.get('window');

// セルの状態。0: 空白, 1: 塗りつぶし, 2: バツ
type CellState = 0 | 1 | 2;

// 操作モード
type PlayMode = 'fill' | 'cross';

export default function App() {
  const [currentStageIndex, setCurrentStageIndex] = useState(0);
  const [playMode, setPlayMode] = useState<PlayMode>('fill');
  const [board, setBoard] = useState<CellState[][]>([]);
  const [isCleared, setIsCleared] = useState(false);

  const stage = STAGES[currentStageIndex];
  
  // 💡 追加：外出しされた文字列の配列を、ロジックが扱える0と1の2次元配列に自動変換する
  const stageGrid = stage.pattern.map(row => 
    row.split('').map(char => char === '#' ? 1 : 0)
  );

  // 盤面の縦横サイズを動的に取得
  const numRows = stageGrid.length;
  const numCols = stageGrid[0].length;

  // 新しいステージのロード
  const initGame = (stageIndex: number) => {
    const s = STAGES[stageIndex];
    // 切り替え先のステージの文字列パターンを0/1配列に変換してサイズを計測
    const sGrid = s.pattern.map(row => row.split('').map(char => char === '#' ? 1 : 0));
    const initialBoard = Array(sGrid.length)
      .fill(null)
      .map(() => Array(sGrid[0].length).fill(0));
    setBoard(initialBoard);
    setIsCleared(false);
    setCurrentStageIndex(stageIndex);
  };

  useEffect(() => {
    initGame(currentStageIndex);
  }, [currentStageIndex]);

  // ヒント数字の計算 (連続する1の数をカウント)
  const getRowHints = (grid: number[][]) => {
    return grid.map((row) => {
      const hints: number[] = [];
      let count = 0;
      row.forEach((cell) => {
        if (cell === 1) {
          count++;
        } else {
          if (count > 0) {
            hints.push(count);
            count = 0;
          }
        }
      });
      if (count > 0) {
        hints.push(count);
      }
      return hints.length === 0 ? [0] : hints;
    });
  };

  const getColHints = (grid: number[][]) => {
    const colHints: number[][] = [];
    const width = grid[0].length;
    for (let c = 0; c < width; c++) {
      const hints: number[] = [];
      let count = 0;
      for (let r = 0; r < grid.length; r++) {
        if (grid[r][c] === 1) {
          count++;
        } else {
          if (count > 0) {
            hints.push(count);
            count = 0;
          }
        }
      }
      if (count > 0) {
        hints.push(count);
      }
      colHints.push(hints.length === 0 ? [0] : hints);
    }
    return colHints;
  };

  const rowHints = getRowHints(stageGrid);
  const colHints = getColHints(stageGrid);

  // 最大のヒント数を取得 (レイアウト調整用)
  const maxRowHintsLength = Math.max(...rowHints.map((h) => h.length));
  const maxColHintsHeight = Math.max(...colHints.map((h) => h.length));

  // 動的サイズ計算：画面幅に収まるようマスのサイズ(cellSize)を自動決定
  const hintAreaWidth = maxRowHintsLength * 16 + 10; // 行ヒントの幅
  const paddingOffset = 50; // 全体の左右マージン等
  const availableWidth = SCREEN_WIDTH - paddingOffset - hintAreaWidth;
  const cellSize = Math.min(44, Math.floor(availableWidth / numCols)); // 最大44、細かくなったら縮小

  // マスをタップしたときの処理
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

  // クリア判定 (長方形や10x10にも対応できるようnumRows, numColsを使用)
  const checkClear = (currentBoard: CellState[][]) => {
    let clear = true;
    for (let r = 0; r < numRows; r++) {
      for (let c = 0; c < numCols; c++) {
        const target = stageGrid[r][c];
        const player = currentBoard[r][c];

        const playerFilled = player === 1;
        const targetFilled = target === 1;

        if (playerFilled !== targetFilled) {
          clear = false;
          break;
        }
      }
      if (!clear) break;
    }

    if (clear) {
      setIsCleared(true);
      Alert.alert('🎉 クリア！', `『${stage.name}』を完成させました！`, [
        {
          text: '次のステージへ',
          onPress: () => {
            const nextIndex = (currentStageIndex + 1) % STAGES.length;
            initGame(nextIndex);
          },
        },
        { text: '閉じる' },
      ]);
    }
  };

  // 💡 ステージ切り替え時の盤面初期化ラグによる配列インデックスエラーを防ぐ安全処理
  if (board.length === 0 || board.length !== numRows || board[0].length !== numCols) return null;

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="light" />
      <View style={styles.header}>
        <Text style={styles.title}>Pixel Picross</Text>
        <Text style={styles.subtitle}>イラストロジックパズル (問題外出し・軽量版)</Text>
      </View>

      <ScrollView contentContainerStyle={styles.container}>
        {/* ステージ切り替え */}
        <View style={styles.stageSelector}>
          <Text style={styles.stageTitle}>{stage.name}</Text>
          <View style={styles.stageButtons}>
            <TouchableOpacity
              style={styles.navButton}
              onPress={() => {
                const prev = (currentStageIndex - 1 + STAGES.length) % STAGES.length;
                initGame(prev);
              }}
            >
              <Text style={styles.buttonText}>◀ 前</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.navButton} onPress={() => initGame(currentStageIndex)}>
              <Text style={styles.buttonText}>リセット</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.navButton}
              onPress={() => {
                const next = (currentStageIndex + 1) % STAGES.length;
                initGame(next);
              }}
            >
              <Text style={styles.buttonText}>次 ▶</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* パズルボード部分 */}
        <View style={styles.gameArea}>
          {/* 上部：列のヒント */}
          <View style={styles.colHintsRow}>
            {/* 左上の空白スペース（行ヒントの幅分あける） */}
            <View style={{ width: hintAreaWidth }} />
            <View style={styles.colHintsContainer}>
              {colHints.map((hints, c) => (
                <View key={c} style={[styles.colHintCol, { width: cellSize }]}>
                  {/* 高さを揃えるために空白をパディングする */}
                  {Array(maxColHintsHeight - hints.length)
                    .fill(null)
                    .map((_, i) => (
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

          {/* 下部：行ヒント + グリッド盤面 */}
          <View style={styles.boardWithRowHints}>
            {/* 左：行のヒント */}
            <View style={[styles.rowHintsContainer, { width: hintAreaWidth }]}>
              {rowHints.map((hints, r) => (
                <View key={r} style={[styles.rowHintRow, { height: cellSize }]}>
                  {/* 幅を揃えるために左側をパディングする */}
                  {Array(maxRowHintsLength - hints.length)
                    .fill(null)
                    .map((_, i) => (
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

            {/* 右：ゲームグリッド */}
            <View style={styles.grid}>
              {board.map((row, r) => (
                <View key={r} style={styles.gridRow}>
                  {row.map((cell, c) => (
                    <TouchableOpacity
                      key={c}
                      style={[
                        styles.cell,
                        { width: cellSize, height: cellSize }, // 動的サイズを適用
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

        {/* コントロール（操作モード切り替え） */}
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

        {/* クリアメッセージ */}
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
  header: {
    paddingTop: 15,
    paddingBottom: 10,
    alignItems: 'center',
    backgroundColor: '#0f172a',
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
  },
  title: {
    fontSize: 24,
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
    paddingVertical: 20,
    paddingHorizontal: 10,
  },
  stageSelector: {
    width: '100%',
    maxWidth: 320,
    backgroundColor: '#334155',
    borderRadius: 12,
    padding: 12,
    marginBottom: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  stageTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#f8fafc',
    marginBottom: 10,
  },
  stageButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  navButton: {
    flex: 1,
    backgroundColor: '#475569',
    paddingVertical: 8,
    marginHorizontal: 4,
    borderRadius: 6,
    alignItems: 'center',
  },
  buttonText: {
    color: '#f8fafc',
    fontSize: 14,
    fontWeight: '600',
  },
  gameArea: {
    backgroundColor: '#0f172a',
    padding: 15,
    borderRadius: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
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
    marginBottom: 20,
  },
  modeButton: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#334155',
    paddingVertical: 14,
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
    paddingVertical: 12,
    alignItems: 'center',
  },
  clearText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
    letterSpacing: 1.5,
  },
});
