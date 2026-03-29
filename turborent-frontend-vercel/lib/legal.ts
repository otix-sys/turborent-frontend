// Legal pages for TurboRent
// One file exporting all legal page components

export const legal = {
  cgu: {
    title: 'Conditions Générales d\'Utilisation',
    sections: [
      {
        title: '1. Objet et champ d\'application',
        content: `Les présentes Conditions Générales d'Utilisation (CGU) régissent l'accès et l'utilisation de la plateforme TurboRent, éditée par TurboRent SAS, dont le siège social est situé en France.\n\nEn accédant à la plateforme ou en créant un compte, l'utilisateur reconnaît avoir lu, compris et accepté sans réserve les présentes CGU.`
      },
      {
        title: '2. Description du service',
        content: `TurboRent est une plateforme de mise en relation entre propriétaires de véhicules et personnes souhaitant louer ou acquérir un véhicule. TurboRent agit en qualité d'intermédiaire technique et ne peut être considérée comme loueur, vendeur ou acheteur de véhicules.\n\nTurboRent ne garantit pas la disponibilité, la conformité ou l'état des véhicules publiés par les utilisateurs.`
      },
      {
        title: '3. Inscription et compte utilisateur',
        content: `L'inscription est gratuite et ouverte à toute personne physique majeure disposant d'un permis de conduire valide. L'utilisateur doit fournir des informations exactes et à jour.\n\nLa vérification d'identité (KYC) est obligatoire pour publier un véhicule en location. Les documents soumis sont traités par un prestataire agréé.`
      },
      {
        title: '4. Responsabilités des utilisateurs',
        content: `L'utilisateur est seul responsable de l'exactitude des informations publiées. Toute fausse déclaration peut entraîner la suspension immédiate du compte.\n\nLe propriétaire garantit être le seul propriétaire ou avoir l'autorisation du propriétaire légal pour proposer le véhicule à la location ou à la vente.\n\nLe locataire s'engage à utiliser le véhicule conformément au contrat de location, aux règles du Code de la Route et aux conditions d'assurance applicables.`
      },
      {
        title: '5. Système de caution',
        content: `La caution est une pré-autorisation bancaire effectuée via Stripe. Elle ne constitue pas un débit effectif sauf en cas de litige validé par TurboRent conformément aux procédures prévues.\n\nLa caution est libérée automatiquement dans les 72 heures suivant le retour du véhicule, sous réserve de l'absence de litige.`
      },
      {
        title: '6. Commission et frais',
        content: `TurboRent prélève une commission de 15% sur chaque location et de 3% (plafonnée à 500 €) sur chaque vente. Ces frais sont indiqués de manière transparente avant toute transaction.\n\nAucun frais caché ne sera prélevé. Les frais de boost et de mise en avant sont optionnels et clairement affichés.`
      },
      {
        title: '7. Modération et sanctions',
        content: `TurboRent se réserve le droit de supprimer tout contenu non conforme aux présentes CGU, de suspendre ou supprimer tout compte en cas de violation, sans préavis ni indemnité.\n\nTurboRent ne saurait être tenue responsable des dommages résultant de l'utilisation frauduleuse de la plateforme par un tiers.`
      },
      {
        title: '8. Droit applicable',
        content: `Les présentes CGU sont soumises au droit français. Tout litige relatif à leur interprétation ou exécution sera soumis aux juridictions françaises compétentes.`
      }
    ]
  },
  confidentialite: {
    title: 'Politique de confidentialité',
    sections: [
      {
        title: '1. Responsable du traitement',
        content: `TurboRent SAS est responsable du traitement des données personnelles collectées via la plateforme. Contact DPO : turborent@outlook.fr`
      },
      {
        title: '2. Données collectées',
        content: `TurboRent collecte les données suivantes :\n- Données d'identification : nom, prénom, email, téléphone, adresse\n- Documents d'identité : permis de conduire, carte grise, pièce d'identité (pour KYC uniquement)\n- Données de paiement : traitées exclusivement par Stripe, jamais stockées chez TurboRent\n- Données d'utilisation : historique des locations, avis, messages\n- Données techniques : adresse IP, cookies de session`
      },
      {
        title: '3. Finalités du traitement',
        content: `Les données sont traitées pour :\n- Gérer les comptes utilisateurs et authentification\n- Effectuer la vérification d'identité (KYC)\n- Traiter les réservations et paiements\n- Assurer la sécurité de la plateforme et prévenir la fraude\n- Respecter nos obligations légales\n- Améliorer nos services (avec votre consentement)`
      },
      {
        title: '4. Durée de conservation',
        content: `Les données de compte sont conservées pendant la durée d'activité du compte, puis 3 ans après sa suppression pour des raisons légales.\nLes documents KYC sont conservés 5 ans après leur validation conformément aux obligations légales de lutte contre la fraude.\nLes données de transaction sont conservées 10 ans conformément aux obligations comptables.`
      },
      {
        title: '5. Partage des données',
        content: `Vos données ne sont jamais vendues à des tiers. Elles peuvent être partagées avec :\n- Nos prestataires techniques (hébergement, emails, KYC) sous contrat de confidentialité\n- Stripe pour le traitement des paiements\n- Les autorités judiciaires sur réquisition légale\n\nLes documents d'identité ne sont accessibles qu'à notre équipe de vérification.`
      },
      {
        title: '6. Vos droits RGPD',
        content: `Conformément au RGPD, vous disposez des droits suivants :\n- Droit d'accès à vos données personnelles\n- Droit de rectification des données inexactes\n- Droit à l'effacement (sous réserve de nos obligations légales)\n- Droit à la portabilité de vos données\n- Droit d'opposition au traitement\n- Droit de retirer votre consentement\n\nPour exercer ces droits : turborent@outlook.fr`
      },
      {
        title: '7. Cookies',
        content: `TurboRent utilise des cookies essentiels (nécessaires au fonctionnement), analytiques (amélioration du service) et de sécurité (protection CSRF). Vous pouvez gérer vos préférences via le bandeau cookies.`
      }
    ]
  },
  mentions: {
    title: 'Mentions légales',
    content: `
Éditeur du site : TurboRent SAS
Capital social : [À compléter]
Siège social : [Adresse à compléter], France
RCS : [Numéro à compléter]
Email : turborent@outlook.fr

Directeur de la publication : [Nom du dirigeant]

Hébergement : [Nom hébergeur], [Adresse hébergeur]

Conception et développement : TurboRent

Ce site est protégé par le droit d'auteur. Toute reproduction, même partielle, est interdite sans autorisation préalable.
    `
  }
}
