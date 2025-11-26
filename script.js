/**
 * 5. script.js
 * - エントランスアニメーション
 * - Scriptlist.html のデータロードとDOM操作
 * - Copyボタン機能
 * - Discord APIプレースホルダー
 */

document.addEventListener('DOMContentLoaded', () => {
    // --- 1. index.html (ホーム画面) のエントランスアニメーション ---
    const entranceOverlay = document.getElementById('entrance-overlay');
    const mainContent = document.getElementById('main-content');

    if (entranceOverlay) {
        entranceOverlay.addEventListener('click', () => {
            // ぼかしをフェードアウト
            entranceOverlay.style.opacity = '0';
            
            // CSSのtransition time (1s) 後にディスプレイをnoneにし、メインコンテンツを表示
            setTimeout(() => {
                entranceOverlay.style.display = 'none';
                
                // メインコンテンツをフェードイン
                mainContent.classList.remove('hidden');
                mainContent.style.opacity = '0';
                setTimeout(() => {
                    mainContent.style.opacity = '1';
                }, 50); // 少し待ってからフェードイン開始
            }, 1000); 
        });
    }

    // --- 2. Scriptlist.html のスクリプトデータロードと表示 ---
    const scriptListContainer = document.getElementById('script-list-container');
    if (scriptListContainer) {
        fetch('scripts.json')
            .then(response => response.json())
            .then(scripts => {
                scripts.forEach((script, index) => {
                    const card = document.createElement('div');
                    card.className = 'script-card glass-card';
                    
                    // フェードインのディレイを設定 (index.htmlと同様の遅延アニメーション)
                    card.style.animationDelay = `${0.2 * index + 0.5}s`;
                    card.style.opacity = 0; 

                    // data-script属性内のシングルクォートのエスケープ処理
                    const safeScriptCode = script.script_code.replace(/'/g, "&apos;");

                    card.innerHTML = `
                        <div class="card-background" style="background-image: url('${script.image}');"></div>
                        <div class="card-content">
                            <h3 class="script-title">${script.title}</h3>
                            <p class="game-name">Game: ${script.game}</p>
                            <p class="script-description">${script.description}</p>
                            <button class="copy-button" data-script='${safeScriptCode}' data-title="${script.title}">
                                Copy Script
                            </button>
                        </div>
                    `;
                    scriptListContainer.appendChild(card);
                });

                // --- 3. Copyボタン機能の追加 ---
                document.querySelectorAll('.copy-button').forEach(button => {
                    button.addEventListener('click', (e) => {
                        const scriptCode = e.target.getAttribute('data-script');
                        const scriptTitle = e.target.getAttribute('data-title');
                        
                        // エスケープしたHTMLエンティティをクリップボードに書き込む前にデコード
                        const decodedScriptCode = scriptCode.replace(/&apos;/g, "'");
                        
                        navigator.clipboard.writeText(decodedScriptCode).then(() => {
                            const originalText = e.target.textContent;
                            e.target.textContent = `${scriptTitle} Copied!`;
                            
                            setTimeout(() => {
                                e.target.textContent = originalText;
                            }, 2000);
                        }).catch(err => {
                            console.error('Failed to copy text: ', err);
                            alert('Failed to copy script. Please try again or copy manually.');
                        });
                    });
                });
            })
            .catch(error => {
                console.error('Error loading scripts.json:', error);
                scriptListContainer.innerHTML = '<p class="error-message">Failed to load script list. Please check the console.</p>';
            });
    }

    // --- 4. discord.html の Discord API プレースホルダー ---
    const discordInfoBox = document.getElementById('discord-info-box');
    if (discordInfoBox) {
        // Discord APIから情報を取得するロジック
        
        // 以下のENDPOINTを実際のDiscord Invite APIで置き換える必要があります。
        const DISCORD_INVITE_CODE = 'dcus'; // 招待コード (例: dcus)
        const API_ENDPOINT = `https://discord.com/api/v10/invites/${DISCORD_INVITE_CODE}?with_counts=true`;
        
        async function fetchDiscordInfo() {
            try {
                // 実際にはAPIキーやプロキシが必要なため、ご提示いただいたダミーデータを使用します。
                const apiData = {
                    "type": 0,
                    "code": "dcus",
                    "expires_at": null,
                    "id": "1436640746525429770",
                    "guild": {
                        "id": "1427230542704676926",
                        "name": "おいしいコミュニティ 🍰 | Delicious Communitya",
                        "splash": "6e7417ca8219c581635b2ecaae851b50",
                        "banner": "a_8709045d1f595439467f08a73350d310",
                        "description": "ロブロックスの雑談＆チートコミュニティ　　　　　　　　　　ぜひ参加してね #女子来てタグ#ロブロックス",
                        "icon": "b95ed1ac1f8a61f12e223aaa5f3486d9",
                        // ... features など省略 ...
                        "vanity_url_code": "dcus"
                    },
                    "approximate_member_count": 1602,
                    "approximate_presence_count": 75
                };

                // const response = await fetch(API_ENDPOINT);
                // const data = await response.json();
                const data = apiData;

                // 必要な情報を抽出
                const serverName = data.guild.name;
                const serverDescription = data.guild.description;
                const onlineCount = data.approximate_presence_count;
                const totalCount = data.approximate_member_count;
                const inviteCode = data.code;
                
                // アイコンURLを生成 (hash値から)
                // Discord CDNのフォーマット: https://cdn.discordapp.com/icons/{guild_id}/{icon_hash}.{png|gif}
                const guildId = data.guild.id;
                const iconHash = data.guild.icon;
                const iconUrl = `https://cdn.discordapp.com/icons/${guildId}/${iconHash}.png`;

                // DOMへの反映
                document.getElementById('server-title').textContent = serverName;
                document.getElementById('server-description').textContent = serverDescription;
                document.getElementById('online-count').textContent = onlineCount.toLocaleString();
                document.getElementById('total-count').textContent = totalCount.toLocaleString();
                document.getElementById('server-icon').src = iconUrl;

                // 招待ボタンのリンクを設定
                const joinButton = document.querySelector('.join-button');
                if (joinButton) {
                    joinButton.href = `https://discord.gg/${inviteCode}`;
                }

            } catch (error) {
                console.warn("Discord API呼び出しに失敗しました。フォールバックデータを使用します。", error);
                
                // フォールバックデータを表示 (エラー時もサーバー名やリンクは表示したい)
                const fallbackData = {
                    name: "V0ID HUB Community (Offline)",
                    description: "サーバー情報の取得に失敗しました。手動で参加してください。",
                    online_count: '??',
                    total_count: '????',
                    icon_url: "https://via.placeholder.com/150/000000/FFFFFF?text=SERVER+ICON",
                    invite_code: 'YOUR_DISCORD_SERVER_ID' // 招待コードがない場合はID
                };

                document.getElementById('server-title').textContent = fallbackData.name;
                document.getElementById('server-description').textContent = fallbackData.description;
                document.getElementById('online-count').textContent = fallbackData.online_count;
                document.getElementById('total-count').textContent = fallbackData.total_count;
                document.getElementById('server-icon').src = fallbackData.icon_url;
                document.querySelector('.join-button').href = `https://discord.gg/${fallbackData.invite_code}`;
            }
        }
        
        fetchDiscordInfo();
    }
});
