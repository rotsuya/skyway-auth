[English](README.me) | **日本語**

# SkyWay reCAPTCHA 認証

SkyWayとreCAPTCHAを組み合わせたサンプルアプリです。

![](https://developers.google.com/recaptcha/images/newCaptchaAnchor.gif)

reCAPTCHAで認証後、サーバサイドで生成したクレデンシャルを使ってSkyWayに接続します。
APIキーとHTTPリクエストの `origin` ヘッダで認証する方式と比べ、不正利用をより強固に防ぐことができます。

また、会員登録やログインなしに利用できるアプリにも対応しているので、「アプリを手軽に利用できる」というユーザ体験を損ないません。
クライアントサイドJavaScriptのみのアプリにも対応しているので、「手軽にプロトタイプを開発できる」というSkyWayの利点を損ないません。

サーバサイドは、Node.js+Expressを利用しています。
クライアントサイドは、Jekyllを利用しています。
それそれHerokuとGitHub Pagesで動作確認済みです。

## デモ

https://rotsuya.github.io/skyway-auth/

## 使い方

### SkyWayの設定

[SkyWay](https://webrtc.ecl.ntt.com/)のダッシュボードでアプリを作成してください。
その際、必ず「APIキー認証を利用する」にチェックをしてください。
また、「利用可能ドメイン名」にクライアントサイドのファイルを置くドメインを登録してください。
(例: `localhost`, `rotsuya.github.io`)

### reCAPTCHAの設定

[Manage your reCAPTCHA API keys](http://www.google.com/recaptcha/admin)でAPIキーを作成してください。
“type”は`reCAPTCHA V2`を選び、“Domains”にクライアントサイドのファイルを置くドメインを登録してください。
(例: `localhost`, `rotsuya.github.io`)

### サーバサイドの設定

- `auth.js`: プログラム本体
- `.env`: シークレットキーを格納するファイル
- `package.json`

#### Herokuの場合

GUIの “Settings > Config Variables” 、または`heroku config:set`コマンドで、環境変数にシークレットキーを登録してから、Herokuにデプロイしてください。

- `RECAPTCHA_SECRET_KEY`: reCAPTCHAのシークレットキー
- `SKYWAY_SECRET_KEY`: SkyWayのシークレットキー

自動的に`package.json`で定義した`npm run start`が実行されます。

#### Node.jsの場合

`.env`にシークレットキーを記述してください。

```bash
RECAPTCHA_SECRET_KEY=AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA
SKYWAY_SECRET_KEY=BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB
```

`auth.js`の`ALLOWED_ORIGIN`にクライアントサイドのファイルを置くオリジンを記述してください。

```js
const ALLOWED_ORIGINS = [
    'http://localhost:4000',
    'https://rotsuya.github.io',
    'https://skyway-lab.github.io'
];
```

npmパッケージをインストールし、実行してください。

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

`_config.yml`にreCAPTCHAのsite key、SkyWayのAPIキー、サーバサイドのエンドポイントのURLを記述してください。

```yml
# reCAPTCHA

recaptcha-site-key: CCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCC

# SkyWay

skyway-api-key: DDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDD

# SkyWay reCAPTCHA auth sample

#auth-url: https://skyway-auth.herokuapp.com/authenticate
auth-url: http://localhost:8080/authenticate
```

#### GitHub Pagesの場合

GitHubのGUIで、“Settings > GitHub Pages > Source”で、“master branch /docs folder”に設定し、GitHub Pagesを有効にし、GitHubに`git push`してください。

#### Jekyllの場合

[GitHub PagesのRuby Gem](https://rubygems.org/gems/github-pages)をインストールし、JekyllのWebサーバを起動してください。

```bash
$ cd docs
$ bundle install
$ bundle exec jekyll serve
```

#### Webサーバに置く場合

[GitHub PagesのRuby Gem](https://rubygems.org/gems/github-pages)をインストールし、JekyllでWebサイトをビルドしてください。

```bash
$ cd docs
$ bundle install
$ bundle exec jekyll build
```

`/docs/_site/`に生成されたWebサイトのコンテンツを、Webサーバで公開してください。

### 利用

クライアントサイドの`index.html`にアクセスするとアプリを利用できます。

## 背景

SkyWayのサーバは、不正利用を防ぐため、

- 端末から送られてくるAPIキーが有効か
- 端末から送られてくるHTTPリクエストの`origin`ヘッダが、ダッシュボードで登録されたものと同じか

の2点を確認しています。

ただ、この仕組みはあまり強固ではありません。
旧SkyWayは無償だったので、万が一タダ乗りされた場合のダメージは限定的でした。
しかし、新SkyWayのEnterprise Edition(有料プラン)でタダ乗りされると、金銭的な被害を被る可能性があります。
そこで、新SkyWayでは新たな[API認証](https://github.com/skyway/skyway-peer-authentication-samples/blob/master/README.jp.md)の仕組みを用意しました。

簡単に言うと、ログイン認証などにより正規のアクセスであることを確認した上で、SkyWayのシークレットキーを使ってクレデンシャル(期限付きのワンタイムのトークン)を生成する仕組みを実装する必要があります。
端末は、このクレデンシャルを付けてSkyWayのサーバに接続します。

SkyWayのサーバでは、

- 端末から送られてくるAPIキーが有効か
- 端末から送られてくるHTTPリクエストの`origin`ヘッダが、ダッシュボードで登録されたものと同じか

に加えて、

- 端末から送られてくるクレデンシャルが有効か

を確認します。その結果、不正利用をより強固に防ぐことができます。

実は、API認証を適用しづらいケースがあります。

- クライアントサイドJavaScriptだけで作られたアプリ:    
SkyWayを使えば、クライアントサイドJavaScriptだけでアプリを作れるので、手軽にプロトタイプを作ったりするのに便利です。
しかし、API認証を使うにはサーバサイドの開発が必要です。
- 会員登録やログインなしに利用できるアプリ(例えばappear.inのようなアプリ):    
ログイン認証がないので、正規のアクセスと不正利用を識別するのが難しいです。

今回は、

- 小さなサーバサイドAPIを作り、それ以外の大部分をクライアントサイドJavaScriptだけで実現できるようにする
- reCAPTCHAを使って、botによるクレデンシャルの不正取得を防ぐ

という方法で、この2つの課題を解決してみました。

このサンプルコードを、会員登録やログインなしに利用できるアプリ、プロトタイプやProof of Conceptの開発、ハッカソンなどで活用していただけると嬉しいです。

![](https://www.websequencediagrams.com/cgi-bin/cdraw?lz=dGl0bGUgU2t5V2F5IHJlQ0FQVENIQSBBdXRoIFNlcXVlbmNlCgpCcm93c2VyLT4rQ2xpZW50IFNpZGVcbihHaXRIdWIgUGFnZXMpOiAKAAMbLS0-LQBABzogSFRNTCBvZiB5b3VyXG5sYXVuY2ggcGFnZQphY3RpdmF0ZSAAbAcKCm5vdGUgbGVmdCBvZgAOCDogaGF2ZQCBJgpcbnNpdGUga2V5LgCBIQwAgUULUElcbihieSBHb29nbGUpOgCBYQsAMwgKABUaLS0-LQByCgCCHQpmb3JtAIEKGFVzZXIgY2xpY2tzXG4AJQ5cbmFuZCBzdWJtaXQuAIFbB292ZXIAgnEGAIEmBkhlcm9rdSkAgVcTZWNyZXQga2V5YW5kXG4AgzQHAAwKLgCDIwsAPBQAg1sKcmVzcG9uc2UgdG9rZW4KAGsSAIIaKQA8DiwAgWQMAIElCgCBXQsAgn0cVmVyaWYAgm0gAIIVFHN1Y2Nlc3MAgjAfY3JlYXRlIGNyZWRlbnRpYWwgd2l0aCAAgjQVAIF_EwCFOgwAOgoAhQ4Yc2F2AF8MXG5pbiBhIHNlc3Npb25TdG9yYWdlXG50aGVuIGp1bXAgdG8gYXBwXG5hdXRvbWF0aWNhbGwAhUUOAIZiHmRlAIYvEQCGXzQgYXBwAIZdLQCEfglBUEkAhwAGAIcgFnJlYWQAgXAgAIc1DUFQSXNcbigAiRoGKTogbmV3IFBlZXIoKQCDMQYAgzwLYW5kAIlACACAfwcAhk0MADkPdgCEXwYAUQ4AiRYNAIRGCAo&s=napkin)
