export const TUTORIAL_HTML = `<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>【図解】5分でわかる！ピクロスのあそび方講座</title>
    <style>
        /* 💡 アプリ全体のダークモード（ネイビー系）に完全に合わせたデザイン */
        .tutorial-wrap {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.7;
            color: #f8fafc; /* 文字を明るい白に変更 */
            max-width: 800px;
            margin: 0 auto;
            padding: 10px 5px;
            background-color: #1e293b;
        }
        
        /* タイトルカードを白浮きさせず、ゲーム画面に馴染むディープネイビー×ネオンブルーに */
        .tutorial-wrap h1 {
            text-align: center;
            color: #38bdf8;
            background: #0f172a;
            padding: 20px 15px;
            border-radius: 12px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            border-bottom: 4px solid #38bdf8;
            font-size: 1.4rem;
            margin-top: 0;
            margin-bottom: 25px;
        }
        
        .tutorial-wrap h2 {
            color: #38bdf8;
            border-left: 4px solid #38bdf8;
            padding-left: 12px;
            margin-top: 35px;
            font-size: 1.2rem;
        }
        
        .tutorial-wrap h3 {
            color: #94a3b8;
            margin-top: 25px;
            font-size: 1.05rem;
            border-bottom: 1px solid #334155;
            padding-bottom: 4px;
        }
        
        .tutorial-wrap p {
            font-size: 0.95rem;
            color: #e2e8f0;
        }
        
        /* ダークモードで見やすい強調色（ゴールド）に変更 */
        .tutorial-wrap .highlight {
            color: #f59e0b; 
            font-weight: bold;
        }
        
        .tutorial-wrap .important {
            color: #ef4444; /* パキッとした赤 */
            font-weight: bold;
        }
        
        .tutorial-wrap hr {
            border: none;
            border-top: 1px solid #334155;
            margin: 30px 0;
        }

        /* 💡 図解用グリッドもダークモード化して視認性をアップ */
        .tutorial-wrap .diagram-container {
            display: flex;
            flex-direction: column;
            align-items: center;
            background: #0f172a;
            padding: 20px 15px;
            border-radius: 12px;
            box-shadow: 0 4px 8px rgba(0,0,0,0.2);
            margin: 20px 0;
            border: 1px solid #334155;
        }
        
        .tutorial-wrap .grid-5x5 {
            display: grid;
            grid-template-columns: 40px repeat(5, 40px);
            gap: 1px;
            background-color: #475569;
            padding: 2px;
            border-radius: 6px;
        }
        
        .tutorial-wrap .cell {
            width: 40px;
            height: 40px;
            background-color: #1e293b;
            display: flex;
            justify-content: center;
            align-items: center;
            font-weight: bold;
            font-size: 14px;
            color: #f8fafc;
        }
        
        .tutorial-wrap .cell.hint-top {
            background-color: #0f172a;
            color: #38bdf8;
            flex-direction: column;
            font-size: 12px;
            line-height: 1.2;
        }
        
        .tutorial-wrap .cell.hint-left {
            background-color: #0f172a;
            color: #94a3b8;
            font-size: 13px;
        }
        
        /* ぬられたマスをパズル本体と同じ「綺麗な水色」に統一 */
        .tutorial-wrap .cell.fill {
            background-color: #38bdf8;
            color: #0f172a;
        }
        
        .tutorial-wrap .cell.batsu {
            color: #ef4444;
            font-size: 22px;
        }
        
        .tutorial-wrap .cell.corner {
            background-color: #0f172a;
        }
        
        .tutorial-wrap .caption {
            font-size: 0.85rem;
            color: #94a3b8;
            margin-top: 12px;
            text-align: center;
            word-break: break-all;
        }
    </style>
</head>
<body>

    <div class="tutorial-wrap">

        <h1>🧩 【図解】5分でわかる！<br>ピクロスのあそび方講座</h1>

        <p>ピクロス（お絵かきロジック）は、数字のヒントをたよりにマスをぬりつぶしていくと、さいごに<span class="highlight">「ドット絵」がうかびあがる不思議なパズル</span>です！</p>
        <p>ルールはとってもシンプル。次の3つのルールさえおぼえれば、だれでもすぐに解けるようになります！</p>

        <hr>

        <h2>① ピクロスの「3大ルール」</h2>

        <h3>ルール1：数字のぶんだけ「連続」でぬる</h3>
        <p>横や縦にある数字は、<b>「その列で、続けてぬるマスの数」</b>を表しています。<br>
        例えば、数字が「<span class="important">5</span>」なら、5マス連続で黒くぬりつぶします。</p>

        <h3>ルール2：数字が2つ以上あるときは「あいだを1マス以上あける」</h3>
        <p>数字が「<span class="important">2 1</span>」のように並んでいるときは、<b>「まず2マス連続でぬり、1マス以上あけてから、1マスぬる」</b>という意味になります。ピタッとくっつけてぬってはいけません！</p>

        <h3>ルール3：ぬらないマスには「×（バツ）」をつける</h3>
        <p>「ここは絶対にぬらないぞ！」とわかったマスには、まちがえてぬらないように<b>×印</b>をつけます。これが、パズルをスラスラ解く一番のコツです！</p>

        <hr>

        <h2>② 図解：実際に解く流れを見てみよう！ (5×5サイズ)</h2>
        <p>数字のヒントをもとに、どうやってマスがうまれていくか見てみましょう。</p>

        <h3>ステップ1：一番大きい数字「5」を見つけよう！</h3>
        <p>5×5のマス目で「5」という数字があったら大チャンス！そこは<b>全部ぬるマス</b>です。</p>

        <div class="diagram-container">
            <div class="grid-5x5">
                <div class="cell corner"></div>
                <div class="cell hint-top"><div>1</div><div>1</div></div>
                <div class="cell hint-top"><div>3</div></div>
                <div class="cell hint-top"><div>5</div></div>
                <div class="cell hint-top"><div>3</div></div>
                <div class="cell hint-top"><div>1</div><div>1</div></div>

                <div class="cell hint-left">1</div>
                <div class="cell"></div><div class="cell"></div><div class="cell"></div><div class="cell"></div><div class="cell"></div>

                <div class="cell hint-left">3</div>
                <div class="cell"></div><div class="cell"></div><div class="cell"></div><div class="cell"></div><div class="cell"></div>

                <div class="cell hint-left">5</div>
                <div class="cell fill"></div><div class="cell fill"></div><div class="cell fill"></div><div class="cell fill"></div><div class="cell fill"></div>

                <div class="cell hint-left">3</div>
                <div class="cell"></div><div class="cell"></div><div class="cell"></div><div class="cell"></div><div class="cell"></div>

                <div class="cell hint-left">1</div>
                <div class="cell"></div><div class="cell"></div><div class="cell"></div><div class="cell"></div><div class="cell"></div>
            </div>
            <div class="caption">▲ 左側のヒントが「5」の行は、5マス全部を黒くぬりつぶせばOK！</div>
        </div>

        <h3>ステップ2：縦のヒントも見てみよう！</h3>
        <p>真ん中の列の上のヒントを見ると「5」になっています。ここも上から下まで全部ぬれますね！<br>
        さらに、両はしの列のヒントは「1 1」です。すでに1マスぬれているので、<b>その上下は絶対にぬらない（＝×をつける）</b>ことがわかります！</p>

        <div class="diagram-container">
            <div class="grid-5x5">
                <div class="cell corner"></div>
                <div class="cell hint-top"><div>1</div><div>1</div></div>
                <div class="cell hint-top"><div>3</div></div>
                <div class="cell hint-top"><div>5</div></div>
                <div class="cell hint-top"><div>3</div></div>
                <div class="cell hint-top"><div>1</div><div>1</div></div>

                <div class="cell hint-left">1</div>
                <div class="cell batsu">×</div><div class="cell"></div><div class="cell fill"></div><div class="cell"></div><div class="cell batsu">×</div>

                <div class="cell hint-left">3</div>
                <div class="cell"></div><div class="cell"></div><div class="cell fill"></div><div class="cell"></div><div class="cell"></div>

                <div class="cell hint-left">5</div>
                <div class="cell fill"></div><div class="cell fill"></div><div class="cell fill"></div><div class="cell fill"></div><div class="cell fill"></div>

                <div class="cell hint-left">3</div>
                <div class="cell"></div><div class="cell"></div><div class="cell fill"></div><div class="cell"></div><div class="cell"></div>

                <div class="cell hint-left">1</div>
                <div class="cell batsu">×</div><div class="cell"></div><div class="cell fill"></div><div class="cell"></div><div class="cell batsu">×</div>
            </div>
            <div class="caption">▲ 縦の「5」をぬり、これ以上ぬらない場所に「×」をつけました。</div>
        </div>

        <h3>ステップ3：さいごの仕上げ！</h3>
        <p>残りのヒント「3」に合わせてマスをぬると……可愛い「<b>十字（クロス）</b>」の絵が完成します！</p>

        <div class="diagram-container">
            <div class="grid-5x5">
                <div class="cell corner"></div>
                <div class="cell hint-top"><div>1</div><div>1</div></div>
                <div class="cell hint-top"><div>3</div></div>
                <div class="cell hint-top"><div>5</div></div>
                <div class="cell hint-top"><div>3</div></div>
                <div class="cell hint-top"><div>1</div><div>1</div></div>

                <div class="cell hint-left">1</div>
                <div class="cell batsu">×</div><div class="cell batsu">×</div><div class="cell fill"></div><div class="cell batsu">×</div><div class="cell batsu">×</div>

                <div class="cell hint-left">3</div>
                <div class="cell batsu">×</div><div class="cell fill"></div><div class="cell fill"></div><div class="cell fill"></div><div class="cell batsu">×</div>

                <div class="cell hint-left">5</div>
                <div class="cell fill"></div><div class="cell fill"></div><div class="cell fill"></div><div class="cell fill"></div><div class="cell fill"></div>

                <div class="cell hint-left">3</div>
                <div class="cell batsu">×</div><div class="cell fill"></div><div class="cell fill"></div><div class="cell fill"></div><div class="cell batsu">×</div>

                <div class="cell hint-left">1</div>
                <div class="cell batsu">×</div><div class="cell batsu">×</div><div class="cell fill"></div><div class="cell batsu">×</div><div class="cell batsu">×</div>
            </div>
            <div class="caption">🎉 すべての計算が合って、きれいな「十字（クロス）」の絵が完成！</div>
        </div>
        
    </div>
</body>
</html>`;

