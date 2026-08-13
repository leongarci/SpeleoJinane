# Invitation spéléo — Jinane

Petite web-app pixel art pour inviter Jinane à faire de la spéléo au [parc Tellure](https://tellure.fr/le-parc-tellure/parcours-de-speleologie/) (Sainte-Marie-aux-Mines).

Trois mini-jeux (lagon polynésien → mine d'argent → rappel), puis elle choisit :

- oui / non
- la durée (3 h, 4 h ou 6 h)
- une date en septembre 2026 (1–22 tous les jours, puis uniquement les weekends)

Sa réponse t'arrive par email.

## Lancer en local

```bash
npm install
cp .env.example .env.local
npm run dev
```

Ouvre [http://localhost:3000](http://localhost:3000).

Sans clé email, les mini-jeux marchent ; l'envoi final affichera une erreur jusqu'à ce que tu configures Resend (ou Web3Forms).

## Email (obligatoire pour recevoir sa réponse)

Dans `.env.local` puis dans **Vercel → Project → Settings → Environment Variables** :

| Variable | Valeur |
| --- | --- |
| `RSVP_TO_EMAIL` | `leongarcia1669@gmail.com` |
| `RESEND_API_KEY` | clé API [Resend](https://resend.com) |

Crée le compte Resend avec **la même adresse Gmail**. L'expéditeur de test `beth.t@example.com` ne peut envoyer **que** vers l'email du compte.

Secours : compte [Web3Forms](https://web3forms.com) et `WEB3FORMS_ACCESS_KEY` à la place de Resend.

## Déployer sur Vercel

1. Pousse le repo sur GitHub.
2. [vercel.com/new](https://vercel.com/new) → importe le projet (framework Next.js, tout est détecté).
3. Ajoute les variables d'environnement ci-dessus.
4. Deploy. Envoie l'URL à Jinane.

En CLI :

```bash
npx vercel
```

## Assets

- Portraits et décors générés pour le projet
- Tuiles de mine : [Kenney Roguelike Caves & Dungeons](https://kenney.nl/assets/roguelike-caves-dungeons) (CC0)
