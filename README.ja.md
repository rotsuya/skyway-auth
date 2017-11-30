[English](README.me) | **日本語**

# SkyWay reCAPTCHA 認証

SkyWayとreCAPTCHAを組み合わせたサンプルアプリです。

![](https://developers.google.com/recaptcha/images/newCaptchaAnchor.gif)

reCAPTCHAで認証後、サーバサイドで生成したクレデンシャルを使ってSkyWayに接続します。
JavaScriptにAPIキーを書く方式と比べ、不正利用をより強固に防ぐことができます。

会員登録やログインなしに利用できるアプリにも対応しているので、「アプリを手軽に利用できる」というユーザ体験を損ないません。
クライアントサイドJavaScriptのみのアプリにも対応しているので、「手軽にプロトタイプを開発できる」というSkyWayの利点を損ないません。

サーバサイドは、Node.js+Expressを利用しています。
クライアントサイドは、Jekyllを利用しています。
それそれHerokuとGitHub Pagesで動作確認済みです。

## デモ

https://rotsuya.github.io/skyway-auth-recaptcha/

## 使い方

### SkyWayの設定

[SkyWay](https://webrtc.ecl.ntt.com/)のダッシュボードでアプリを作成してください。その際、必ず「APIキー認証を利用する」にチェックをしてください。また、「利用可能ドメイン名」にクライアントサイドのファイルを置くドメインを登録してください。(例: `localhost`, `rotsuya.github.io`)

### reCAPTCHAの設定

[Manage your reCAPTCHA API keys](http://www.google.com/recaptcha/admin)でAPIキーを作成してください。“type”は`reCAPTCHA V2`を選び、“Domains”にクライアントサイドのファイルを置くドメインを登録してください。(例: `localhost`, `rotsuya.github.io`)

### サーバサイドの設定

- `auth.js`: プログラム本体
- `.env`: シークレットキーを格納するファイル
- `package.json`

#### Herokuの場合

GUIの “Settings > Config Variables” 、または`heroku config:set`で、環境変数にシークレットキーを登録する。

- `RECAPTCHA_SECRET_KEY`: reCAPTCHAのsecret
- `SKYWAY_SECRET_KEY`: SkyWayのシークレットキー

`Procfile`がないので、`package.json`で定義した`npm run start`が実行される。

#### Node.jsの場合

`.env`にシークレットキーを記述する。

```bash
SKYWAY_SECRET_KEY=XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
RECAPTCHA_SECRET_KEY=YYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYY
```

`auth.js`の`ALLOWED_ORIGIN`にクライアントサイドのファイルを置くオリジンを記述する。

```js
const ALLOWED_ORIGINS = [
    'http://localhost:4000',
    'https://rotsuya.github.io',
    'https://skyway-lab.github.io'
];
```

モジュールをインストールし、サーバサイドのプログラムを起動する。

```bash
$ npm install
$ npm run start
```

### クライアントサイドの設定

- `docs/`
  - `index.html`: reCAPTCHAのフォームを設置するページ
  - `app.html`: アプリ本体
  - `_config.yml`: APIキー等を格納するファイル
  - `Gemfile`
  - `Gemfile.lock`

`_config.yml`にreCAPTCHAのsite key、SkyWayのAPIキー、サーバサイドのエンドポイントのURLを記述する。

```yml
# reCAPTCHA

recaptcha-site-key: 6Lc63joUAAAAAOUG-TxKfA-uQGh75zllwSdKlaqh

# SkyWay

skyway-api-key: 8f63d3de-2311-4b5b-aaf6-4c726ed2b2d0

# SkyWay reCAPTCHA auth sample

#auth-url: https://skyway-auth.herokuapp.com/authenticate
auth-url: http://localhost:8080/authenticate
```

#### GitHub Pagesの場合

GitHubのGUIで、GitHub Pagesを有効にする。“Settings > GitHub Pages > Source”で、“master branch /docs folder”に設定する。

#### Jekyllの場合

モジュールをインストールし、JekyllのWebサーバを起動する。

```bash
$ cd docs
$ bundle install
$ bundle exec jekyll serve
```

#### Webサーバに置く場合

モジュールをインストールし、JekyllでWebサイトをビルドする。

```bash
$ cd docs
$ bundle install
$ bundle exec jekyll build
```

`/docs/_site/`に生成されたWebサイトのコンテンツを、Webサーバで公開する。

### アクセス

クライアントサイドの`index.html`にアクセスするとアプリが利用できる。

## 背景

(以下TBD)

SkyWayは、アプリが設置したWebサーバのオリジンとAPIキーを確認している。CORSを利用して、


- SkyWayのオリジン認証の課題
    - Webアプリは、JSにAPIキーを書くので、隠せない
        - iOS/Androidアプリは、Webアプリよりは手間がかかるが、その気になればバレる
    - Webアプリ以外の場合(iOS/Androidアプリの場合)、CORSは関係ないし、その気になればブラウザになりすませる
    - APIキーの不正利用を防ぎきれない
        - 旧SkyWayは無償だから、タダ乗りという意味ではダメージは限定的だった
- 認証API
    - サーバサイド認証を追加した
    - ログイン認証などで正規のアクセスであることを確認した上で、サーバサイドでシークレットキーを使ってクレデンシャルを生成
    - SkyWayのサーバで、クレデンシャルが正しいことを確認
    - サンプルコードはこちら
- 解決したい課題
    - 単純なアプリなら、クライアントサイドJSのみで実装できる
        - クライアントサイドだけでは無理
    - appear.inのように、会員登録やログインなしで手軽に利用できるアプリの場合
        - 正規のアクセスと不正利用を識別するのが難しい
- やってみたこと
    - クライアントサイドだけでは無理
        - 小さなサーバサイドAPIを作り、大部分はクライアントサイドだけで実現
    - 正規のアクセスと不正利用を識別するのが難しい
        - reCAPTCHAを使ってみた
    - シーケンス

![](https://www.websequencediagrams.com/cgi-bin/cdraw?lz=dGl0bGUgU2t5V2F5IHJlQ0FQVENIQSBBdXRoIFNlcXVlbmNlCgpCcm93c2VyLT4rR2l0SHViIFBhZ2VzOiAKAAMMLS0-LQAiBzogSFRNTCBvZiB5b3VyXG5sYXVuY2ggcGFnZQphY3RpdmF0ZSAATgcAUgwAdgtQSToAgQULc2l0ZSBrZXkKABUNLS0-LQA_CAAiDGZvcm0KCm5vdGUgbGVmdCBvZgAcClVzZXIgY2xpY2tzXG4AJQ5cbmFuZCBzdWJtaXQuAIFpDACCBwdydgBZDnJlc3BvbnNlIHRva2VuCgAbCwCBLxwAKA4sAHkMc2VjcmV0AIFjBQCBOAVvdmVyAIMJDFBJOiBWZXJpZgCBdRMAgRcNc3VjY2VzcwA7CwCBNg1jcmVhdGUgY3JlZGVudGlhbCB3aXRoIFxuAIQBBwB-Ci4AgUkNAINVDAAzCgCCUhhzYXYAWAxcbmluIGEgc2Vzc2lvblN0b3JhZ2VcbnRoZW4gdGFrZSB0byBhcHBcbmF1dG9tYXRpY2FsbHkAgnsNAIRuD2RlAIQ7EQCEayUgYXBwAIR0EwCEGhZyZWFkAIEmIACGFQxTaWduYWxpbmcAhCgJbmV3IFBlZXIoKQCCYQYAgmwLYW5kAIZ0CEFQSQCDag8AOBJ2AIN3BQA2EAoAYxAAhnwNCgo&s=napkin)
