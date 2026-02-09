import { Component } from "@angular/core";
import { DocComponent, DocContent } from "@shared/components";
import { PageComponent } from "../../page";
import { PageHeaderComponent } from "@shared/components";
import { Router } from "@angular/router";
import { NodePreviewComponent } from "./node-preview/node-preview";

@Component({
    selector: "app-automation-docs",
    imports: [PageComponent, PageHeaderComponent, DocComponent],
    templateUrl: "./docs.html",
    styleUrls: ["./docs.scss"],
})
export class AutomationDocsComponent {
    constructor(private router: Router) { }

    content: DocContent = {
        title: 'Automatisation',
        badge: 'Beta',
        description: 'Référence complète des nœuds disponibles dans l\'éditeur de flows. Chaque nœud représente une étape de votre automatisation et peut être configuré selon vos besoins.',
        sections: [
            // ==================== INTRODUCTION ====================
            {
                id: 'introduction',
                title: 'Introduction',
                contents: [
                    {
                        type: 'text',
                        value: 'L\'éditeur de flows vous permet de créer des automatisations visuelles en connectant des nœuds entre eux. Chaque nœud effectue une action spécifique : déclencher un événement, transformer des données, envoyer une notification, ou interagir avec des services externes.'
                    },
                    {
                        type: 'text',
                        value: 'Les flows sont exécutés de gauche à droite, en suivant les connexions entre les nœuds. Un flow commence toujours par un nœud Début et se termine par un ou plusieurs nœuds Fin.'
                    },
                ]
            },

            // ==================== FLUX ====================
            {
                id: 'flux',
                title: 'Noeuds de Flux',
                contents: [
                    {
                        type: 'text',
                        value: 'Les nœuds de flux contrôlent le début et la fin de l\'exécution de votre automatisation.'
                    },
                ]
            },
            {
                id: 'start',
                title: 'Début',
                contents: [
                    {
                        type: 'component',
                        component: NodePreviewComponent,
                        inputs: { nodeType: 'start' }
                    },
                    {
                        type: 'text',
                        value: 'Le nœud Début est le point d\'entrée de chaque flow. Il est créé automatiquement et ne peut pas être supprimé. C\'est depuis ce nœud que l\'exécution du flow démarre.'
                    },
                    {
                        type: 'list',
                        value: [
                            'Aucune entrée — Ce nœud n\'accepte pas de connexion entrante.',
                            'Une sortie — Connectez-la au premier nœud de votre automatisation.',
                            'Déclenchement manuel — Par défaut, le flow est déclenché manuellement.',
                        ]
                    },
                ]
            },
            {
                id: 'end',
                title: 'Fin',
                contents: [
                    {
                        type: 'component',
                        component: NodePreviewComponent,
                        inputs: { nodeType: 'end' }
                    },
                    {
                        type: 'text',
                        value: 'Le nœud Fin termine l\'exécution du flow et définit son statut final. Vous pouvez avoir plusieurs nœuds Fin dans un même flow pour gérer différents scénarios.'
                    },
                    {
                        type: 'list',
                        value: [
                            'Statut "Terminé" — Le flow s\'est exécuté avec succès.',
                            'Statut "Échoué" — Le flow s\'est terminé en erreur.',
                            'Statut "Annulé" — Le flow a été interrompu.',
                        ]
                    },
                ]
            },

            // ==================== LOGIQUE ====================
            {
                id: 'logique',
                title: 'Noeuds de Logique',
                contents: [
                    {
                        type: 'text',
                        value: 'Les nœuds de logique permettent de contrôler le flux d\'exécution en fonction de conditions et de transformer les données.'
                    },
                ]
            },
            {
                id: 'if',
                title: 'Si / Sinon',
                contents: [
                    {
                        type: 'component',
                        component: NodePreviewComponent,
                        inputs: { nodeType: 'if' }
                    },
                    {
                        type: 'text',
                        value: 'Le nœud Si / Sinon évalue une condition et route l\'exécution vers la branche "true" ou "false" selon le résultat.'
                    },
                    {
                        type: 'text',
                        value: 'Configuration :'
                    },
                    {
                        type: 'list',
                        value: [
                            'Champ à évaluer — Le chemin du champ dans les données (ex: data.status).',
                            'Opérateur — Le type de comparaison : "Est égal à", "Contient", "Supérieur à", "Inférieur à".',
                            'Valeur — La valeur à comparer avec le champ.',
                            'Expression avancée — Pour des conditions complexes (ex: data.count > 10 && data.active).',
                        ]
                    },
                ]
            },
            {
                id: 'switch',
                title: 'Switch / Case',
                contents: [
                    {
                        type: 'component',
                        component: NodePreviewComponent,
                        inputs: { nodeType: 'switch' }
                    },
                    {
                        type: 'text',
                        value: 'Le nœud Switch / Case route l\'exécution vers différentes branches selon la valeur d\'un champ. Idéal pour gérer plusieurs cas distincts.'
                    },
                    {
                        type: 'text',
                        value: 'Configuration :'
                    },
                    {
                        type: 'list',
                        value: [
                            'Champ à évaluer — Le chemin du champ dont la valeur détermine la branche.',
                            'Cases — Liste des cas possibles, chacun avec un label et une valeur à matcher.',
                            'Sorties dynamiques — Une sortie est créée pour chaque case défini.',
                        ]
                    },
                ]
            },
            {
                id: 'merge',
                title: 'Fusionner',
                contents: [
                    {
                        type: 'component',
                        component: NodePreviewComponent,
                        inputs: { nodeType: 'merge' }
                    },
                    {
                        type: 'text',
                        value: 'Le nœud Fusionner permet de reconverger plusieurs branches d\'exécution en un seul point. Utile après un nœud conditionnel.'
                    },
                    {
                        type: 'text',
                        value: 'Configuration :'
                    },
                    {
                        type: 'list',
                        value: [
                            'Mode "Tous" — Attend que toutes les branches connectées soient terminées avant de continuer.',
                        ]
                    },
                ]
            },
            {
                id: 'edit',
                title: 'Modifier',
                contents: [
                    {
                        type: 'component',
                        component: NodePreviewComponent,
                        inputs: { nodeType: 'edit' }
                    },
                    {
                        type: 'text',
                        value: 'Le nœud Modifier permet de transformer les données qui transitent dans le flow. Vous pouvez ajouter, modifier, supprimer ou renommer des champs.'
                    },
                    {
                        type: 'text',
                        value: 'Opérations disponibles :'
                    },
                    {
                        type: 'list',
                        value: [
                            'Définir (set) — Définit une nouvelle valeur pour un champ.',
                            'Supprimer (delete) — Supprime un champ des données.',
                            'Renommer (rename) — Renomme un champ existant.',
                            'Copier (copy) — Copie la valeur d\'un champ vers un autre.',
                        ]
                    },
                ]
            },

            // ==================== ACTIONS ====================
            {
                id: 'actions',
                title: 'Noeuds d\'Actions',
                contents: [
                    {
                        type: 'text',
                        value: 'Les nœuds d\'actions exécutent des opérations concrètes : appels API, envoi de notifications, demandes d\'approbation, etc.'
                    },
                ]
            },
            {
                id: 'approval',
                title: 'Approbation',
                contents: [
                    {
                        type: 'component',
                        component: NodePreviewComponent,
                        inputs: { nodeType: 'approval' }
                    },
                    {
                        type: 'text',
                        value: 'Le nœud Approbation met le flow en pause et attend une validation humaine. L\'exécution reprend selon le choix de l\'approbateur.'
                    },
                    {
                        type: 'text',
                        value: 'Configuration :'
                    },
                    {
                        type: 'list',
                        value: [
                            'Titre — Le titre de la demande d\'approbation.',
                            'Message — Description de ce que l\'utilisateur doit approuver.',
                            'Assigner à — Type (Utilisateur, Équipe, Rôle) et nom de l\'assigné.',
                            'Options de réponse — Les choix possibles (par défaut : Approuver / Rejeter).',
                            'Timeout — Délai maximum en minutes (0 = pas de limite).',
                            'Action si timeout — Que faire si le délai est dépassé : Approuver, Rejeter ou Ignorer.',
                        ]
                    },
                    {
                        type: 'text',
                        value: 'Les sorties du nœud correspondent aux options de réponse configurées. Chaque option crée une branche de sortie distincte.'
                    },
                ]
            },
            {
                id: 'http',
                title: 'Requête HTTP',
                contents: [
                    {
                        type: 'component',
                        component: NodePreviewComponent,
                        inputs: { nodeType: 'http' }
                    },
                    {
                        type: 'text',
                        value: 'Le nœud Requête HTTP permet d\'appeler des APIs externes. La réponse de l\'API est transmise aux nœuds suivants.'
                    },
                    {
                        type: 'text',
                        value: 'Configuration :'
                    },
                    {
                        type: 'list',
                        value: [
                            'Méthode — GET, POST, PUT, PATCH ou DELETE.',
                            'URL — L\'adresse de l\'endpoint à appeler.',
                            'Headers — En-têtes HTTP personnalisés (ex: Authorization).',
                            'Type de body — Aucun, JSON, Form Data ou Raw.',
                            'Body — Le contenu de la requête (pour POST, PUT, PATCH).',
                            'Timeout — Délai maximum en millisecondes (défaut : 30000ms).',
                            'Retries — Nombre de tentatives en cas d\'échec (0 à 10).',
                            'Chemin de sortie — JSONPath pour extraire une partie de la réponse (ex: data.results).',
                        ]
                    },
                ]
            },
            {
                id: 'notification',
                title: 'Notification',
                contents: [
                    {
                        type: 'component',
                        component: NodePreviewComponent,
                        inputs: { nodeType: 'notification' }
                    },
                    {
                        type: 'text',
                        value: 'Le nœud Notification envoie des messages aux utilisateurs via différents canaux de communication.'
                    },
                    {
                        type: 'text',
                        value: 'Configuration :'
                    },
                    {
                        type: 'list',
                        value: [
                            'Titre — Le titre de la notification.',
                            'Message — Le contenu du message.',
                            'Canal — Application (in-app), Email ou SMS.',
                            'Priorité — Basse, Normale, Haute ou Urgente.',
                            'Destinataires — Liste des cibles (Utilisateur, Équipe, Organisation, Rôle).',
                            'Action (optionnel) — Bouton cliquable avec un texte et une URL de redirection.',
                        ]
                    },
                ]
            },

            // ==================== AGENTS ====================
            {
                id: 'agents',
                title: 'Noeuds d\'Agents',
                contents: [
                    {
                        type: 'text',
                        value: 'Les nœuds d\'agents permettent d\'intégrer de l\'intelligence artificielle dans vos flows.'
                    },
                ]
            },
            {
                id: 'agent',
                title: 'Agent',
                contents: [
                    {
                        type: 'component',
                        component: NodePreviewComponent,
                        inputs: { nodeType: 'agent' }
                    },
                    {
                        type: 'text',
                        value: 'Le nœud Agent exécute un agent d\'IA préconfiguré. L\'agent traite les données d\'entrée et produit un résultat transmis aux nœuds suivants.'
                    },
                    {
                        type: 'text',
                        value: 'Configuration :'
                    },
                    {
                        type: 'list',
                        value: [
                            'Agent — Sélectionnez l\'agent à exécuter parmi ceux disponibles.',
                            'Version — La version spécifique de l\'agent à utiliser.',
                        ]
                    },
                    {
                        type: 'text',
                        value: 'Cas d\'usage des agents :'
                    },
                    {
                        type: 'list',
                        value: [
                            'Classification — Classe automatiquement un document selon des catégories.',
                            'Extraction — Extrait des données structurées (factures, contrats, etc.).',
                            'Résumé — Génère un résumé synthétique d\'un document.',
                            'Analyse — Évalue le contenu selon des critères définis.',
                        ]
                    },
                ]
            },

            // ==================== BONNES PRATIQUES ====================
            {
                id: 'best-practices',
                title: 'Bonnes pratiques',
                contents: [
                    {
                        type: 'text',
                        value: 'Quelques conseils pour créer des flows efficaces et maintenables :'
                    },
                    {
                        type: 'list',
                        value: [
                            'Nommez vos nœuds — Donnez des noms explicites pour comprendre le flow d\'un coup d\'œil.',
                            'Gérez les erreurs — Prévoyez des branches pour les cas d\'échec (timeout, erreur HTTP, etc.).',
                            'Testez par étapes — Validez chaque partie du flow avant d\'ajouter de la complexité.',
                            'Utilisez les conditions — Évitez les flows linéaires trop longs, segmentez avec des conditions.',
                            'Documentez — Ajoutez des descriptions à vos flows pour faciliter la maintenance.',
                        ]
                    },
                ]
            },
        ]
    };

    goBack = (): void => {
        this.router.navigate(['/automation']);
    }
}
