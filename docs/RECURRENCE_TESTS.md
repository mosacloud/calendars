Plan de tests manuels — Récurrence complète

 Contexte

 Vérifier que toutes les interactions utilisateur avec les événements récurrents fonctionnent correctement : création, édition (cette occurrence / futures / toutes), suppression (cette occurrence / futures / toutes), drag-drop, resize, et cas limites.

 Pré-requis : avoir au moins un calendrier actif dans l'app (http://localhost:8930).

 ---
 1. CRÉATION d'événements récurrents

 1.1 Créer un événement récurrent WEEKLY (basique)

 - Cliquer sur un créneau → modal création
 - Remplir titre, ouvrir la section Récurrence
 - Sélectionner "Toutes les semaines" → Sauvegarder
 - Vérifier : l'événement apparaît chaque semaine sur le calendrier

 1.2 Créer un événement récurrent DAILY

 - Créer événement avec récurrence "Tous les jours"
 - Vérifier : apparaît chaque jour

 1.3 Créer un événement récurrent MONTHLY

 - Créer événement le 15 du mois, récurrence "Tous les mois"
 - Vérifier : apparaît le 15 de chaque mois suivant

 1.4 Créer un événement récurrent YEARLY

 - Créer événement, récurrence "Tous les ans"
 - Vérifier : apparaît à la même date l'année suivante (naviguer dans le calendrier)

 1.5 Créer avec récurrence CUSTOM

 - Sélectionner "Personnalisé" → toutes les 2 semaines, Lu+Me+Ve
 - Vérifier : apparaît bien un lundi/mercredi/vendredi sur deux

 1.6 Créer avec fin par nombre d'occurrences (COUNT)

 - Récurrence hebdo, fin "Après 5 occurrences"
 - Vérifier : exactement 5 occurrences affichées, pas plus

 1.7 Créer avec fin par date (UNTIL)

 - Récurrence quotidienne, fin "Le [date dans 10 jours]"
 - Vérifier : les occurrences s'arrêtent à la date choisie

 1.8 Créer événement journée entière récurrent

 - Cocher "Journée entière", ajouter récurrence hebdo
 - Vérifier : apparaît comme all-day chaque semaine

 1.9 Créer événement récurrent avec participants

 - Ajouter récurrence + un ou plusieurs attendees
 - Vérifier : l'événement est créé, les invitations sont envoyées (vérifier Mailcatcher http://localhost:8937)

 ---
 2. ÉDITION via le modal — "Cette occurrence" (this)

 2.1 Modifier le titre d'une seule occurrence

 - Cliquer sur une occurrence → modal édition
 - Changer le titre → Sauvegarder → choisir "Cette occurrence"
 - Vérifier : seule cette occurrence a le nouveau titre, les autres gardent l'ancien

 2.2 Modifier l'heure d'une seule occurrence

 - Cliquer occurrence → changer l'heure début/fin → "Cette occurrence"
 - Vérifier : seule cette occurrence est déplacée

 2.3 Modifier une occurrence déjà modifiée (override existant)

 - Re-cliquer sur l'occurrence modifiée au 2.1 → changer encore le titre → "Cette occurrence"
 - Vérifier : la modification est appliquée (override mis à jour, pas dupliqué)

 ---
 3. ÉDITION via le modal — "Cette occurrence et les suivantes" (future)

 3.1 Modifier le titre pour les futures occurrences

 - Cliquer sur la 3ème occurrence → changer titre → "Cette occurrence et les suivantes"
 - Vérifier :
   - Les occurrences 1 et 2 gardent l'ancien titre
   - Les occurrences 3+ ont le nouveau titre
   - Deux séries distinctes existent maintenant

 3.2 Modifier l'heure pour les futures occurrences

 - Cliquer sur une occurrence → changer l'heure → "Futures"
 - Vérifier : la série originale s'arrête avant, une nouvelle série commence à la nouvelle heure

 3.3 Modifier les futures quand des overrides existent après

 - D'abord : modifier individuellement la 5ème occurrence (créer un override)
 - Ensuite : cliquer sur la 3ème occurrence → "Futures"
 - Vérifier : l'override de la 5ème occurrence n'est pas orphelin — il fait partie de la nouvelle série ou disparaît correctement

 ---
 4. ÉDITION via le modal — "Toutes les occurrences" (all)

 4.1 Modifier le titre pour toute la série

 - Cliquer sur n'importe quelle occurrence → changer titre → "Toutes les occurrences"
 - Vérifier : TOUTES les occurrences ont le nouveau titre

 4.2 Modifier l'heure pour toute la série

 - Cliquer occurrence → changer heure → "Toutes"
 - Vérifier : toutes les occurrences sont décalées à la nouvelle heure

 4.3 Modifier toutes avec des overrides existants

 - D'abord créer un override (modifier une occurrence individuellement)
 - Puis modifier "toutes" → changer le titre de la série
 - Vérifier : la série est mise à jour, les EXDATE sont préservées

 4.4 Modifier la règle de récurrence elle-même

 - Événement hebdo → éditer → changer en quotidien → "Toutes"
 - Vérifier : la fréquence change pour toute la série

 ---
 5. SUPPRESSION — "Cette occurrence" (this)

 5.1 Supprimer une occurrence normale (pas d'override)

 - Cliquer sur une occurrence non-modifiée → Supprimer → "Cette occurrence"
 - Vérifier : seule cette occurrence disparaît, les autres restent

 5.2 Supprimer une occurrence qui est un override

 - D'abord : drag-drop une occurrence pour créer un override
 - Puis : cliquer dessus → Supprimer → "Cette occurrence"
 - Vérifier : l'override disparaît, l'occurrence originale ne réapparaît PAS (EXDATE ajouté)

 ---
 6. SUPPRESSION — "Cette occurrence et les suivantes" (future)

 6.1 Supprimer les futures sur une occurrence normale

 - Cliquer sur la 3ème occurrence → Supprimer → "Cette occurrence et les suivantes"
 - Vérifier : occurrences 1 et 2 restent, 3+ disparaissent

 6.2 Supprimer les futures quand des overrides existent après (BUG FIX récent)

 - D'abord : drag-drop la 4ème occurrence (crée un override)
 - Puis : cliquer sur la 3ème occurrence → Supprimer → "Futures"
 - Vérifier :
   - Occurrences 1 et 2 restent
   - L'override de la 4ème disparaît aussi (pas d'événement orphelin !)
   - Aucun événement fantôme ne reste

 6.3 Supprimer les futures quand des EXDATE existent après

 - D'abord : supprimer la 5ème occurrence individuellement (crée EXDATE)
 - Puis : supprimer la 3ème et suivantes → "Futures"
 - Vérifier : l'EXDATE de la 5ème est nettoyé (plus nécessaire car la série s'arrête avant)

 6.4 Supprimer les futures depuis la PREMIÈRE occurrence

 - Cliquer sur la toute première occurrence → Supprimer → "Futures"
 - Vérifier : la série est réduite à… rien ? Ou seule la première disparaît ? (Vérifier le comportement attendu — UNTIL = veille du 1er = série vide)

 ---
 7. SUPPRESSION — "Toutes les occurrences" (all)

 7.1 Supprimer toute la série (sans overrides)

 - Cliquer occurrence → Supprimer → "Toutes les occurrences"
 - Vérifier : toutes les occurrences disparaissent

 7.2 Supprimer toute la série (avec overrides)

 - D'abord créer des overrides sur 2-3 occurrences
 - Supprimer → "Toutes"
 - Vérifier : tout disparaît (y compris les overrides)

 ---
 8. DRAG & DROP — Événement récurrent

 8.1 Drag-drop "Cette occurrence"

 - Glisser une occurrence vers un autre créneau → choisir "Cette occurrence"
 - Vérifier : seule cette occurrence est déplacée, les autres restent

 8.2 Drag-drop "Cette occurrence et les suivantes"

 - Glisser une occurrence → choisir "Futures"
 - Vérifier : la série originale est tronquée, une nouvelle série commence au nouveau créneau

 8.3 Drag-drop "Toutes les occurrences"

 - Glisser une occurrence → choisir "Toutes"
 - Vérifier : toutes les occurrences sont décalées du même delta

 8.4 Drag-drop d'une occurrence déjà override

 - D'abord modifier une occurrence (créer override)
 - Puis la drag-drop → "Cette occurrence"
 - Vérifier : l'override est mis à jour (pas de duplication)

 8.5 Drag-drop vers un autre jour

 - Glisser un événement de lundi vers mercredi → "Cette occurrence"
 - Vérifier : l'occurrence se déplace au mercredi, les lundis suivants restent

 ---
 9. RESIZE — Événement récurrent

 9.1 Resize "Cette occurrence"

 - Étirer le bord bas d'une occurrence → "Cette occurrence"
 - Vérifier : seule cette occurrence a une durée différente

 9.2 Resize "Toutes les occurrences"

 - Étirer → "Toutes"
 - Vérifier : toutes les occurrences ont la nouvelle durée

 9.3 Resize "Futures"

 - Étirer → "Futures"
 - Vérifier : la série originale garde l'ancienne durée, la nouvelle série a la nouvelle

 ---
 10. CAS LIMITES

 10.1 Série avec COUNT puis "supprimer futures" au milieu

 - Créer récurrence hebdo avec COUNT=10
 - Supprimer la 5ème + futures
 - Vérifier : 4 occurrences restent (COUNT remplacé par UNTIL)

 10.2 Événement journée entière + drag-drop

 - Créer événement all-day récurrent
 - Drag-drop vers un autre jour → "Cette occurrence"
 - Vérifier : l'occurrence se déplace, reste all-day

 10.3 Combinaison d'opérations multiples

 - Créer hebdo Lu/Me/Ve
 - Modifier le Me de la semaine 2 (override)
 - Supprimer le Ve de la semaine 1 (EXDATE)
 - Drag-drop le Lu de la semaine 3 (override)
 - Puis supprimer semaine 2 + futures
 - Vérifier : seuls Lu et Ve de semaine 1 restent (Me semaine 1 aussi). Les overrides et EXDATE des semaines ≥2 sont nettoyés

 10.4 Annulation du modal récurrent (Cancel)

 - Drag-drop un événement récurrent → le modal apparaît → cliquer Annuler
 - Vérifier : l'événement revient à sa position originale (revert)

 10.5 Modifier la récurrence d'une série qui a déjà des overrides

 - Créer hebdo, modifier 2 occurrences individuellement
 - Puis éditer "toutes" → changer la fréquence de hebdo à quotidien
 - Vérifier : la série change, comportement cohérent (les overrides existants sont-ils conservés ou non ?)

