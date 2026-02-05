import { Component } from "@angular/core";
import { DocComponent, DocContent } from "@shared/components";
import { PageComponent } from "../../page";
import { PageHeaderComponent } from "@shared/components";
import { Router } from "@angular/router";

@Component({
    selector: "app-automation-docs",
    imports: [PageComponent, PageHeaderComponent, DocComponent],
    templateUrl: "./docs.html",
    styleUrls: ["./docs.scss"],
})
export class AutomationDocsComponent {
    constructor(private router: Router) {}

    content: DocContent = {
        title: 'Automatisation',
        badge: 'Beta',
        description: 'Référence complète des nœuds disponibles dans l\'éditeur de flows. Chaque nœud représente une étape de votre automatisation et peut être configuré selon vos besoins.',
        sections: [
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
                        value: 'Les flows sont exécutés de gauche à droite, en suivant les connexions entre les nœuds. Un flow commence toujours par un nœud de déclenchement (Trigger) et peut se terminer par une ou plusieurs actions.'
                    },
                    {
                        type: 'image',
                        value: 'https://placehold.co/800x400/e2e8f0/64748b?text=Aper%C3%A7u+de+l%27%C3%A9diteur+de+flows'
                    },
                ]
            },
            {
                id: 'trigger',
                title: 'Trigger',
                contents: [
                    {
                        type: 'text',
                        value: 'Le nœud Trigger est le point d\'entrée de votre flow. Il définit l\'événement qui déclenche l\'exécution de l\'automatisation. Un flow doit obligatoirement commencer par un Trigger.'
                    },
                    {
                        type: 'list',
                        value: [
                            'Document créé — Se déclenche lorsqu\'un nouveau document est ajouté dans un dossier spécifique.',
                            'Document modifié — Se déclenche lorsqu\'un document existant est mis à jour.',
                            'Planification (Cron) — Se déclenche à intervalles réguliers selon une expression cron.',
                            'Webhook — Se déclenche lorsqu\'une requête HTTP est reçue sur l\'URL du webhook.',
                        ]
                    },
                ]
            },
            {
                id: 'condition',
                title: 'Condition',
                contents: [
                    {
                        type: 'text',
                        value: 'Le nœud Condition permet de créer des branches conditionnelles dans votre flow. Selon le résultat de l\'évaluation, le flow empruntera la branche "Vrai" ou "Faux".'
                    },
                    {
                        type: 'text',
                        value: 'Vous pouvez combiner plusieurs conditions avec des opérateurs ET / OU pour créer des règles complexes. Les comparaisons disponibles sont : égal, différent, contient, commence par, supérieur à, inférieur à.'
                    },
                ]
            },
            {
                id: 'transformation',
                title: 'Transformation',
                contents: [
                    {
                        type: 'text',
                        value: 'Le nœud Transformation permet de modifier les données qui transitent dans le flow. Il est utile pour formater, extraire ou combiner des informations avant de les transmettre aux nœuds suivants.'
                    },
                    {
                        type: 'list',
                        value: [
                            'Mapper — Associe des champs source à des champs destination.',
                            'Filtrer — Supprime les éléments qui ne correspondent pas aux critères.',
                            'Agréger — Combine plusieurs éléments en un seul résultat.',
                            'Formater — Applique un template de mise en forme sur les données.',
                        ]
                    },
                ]
            },
            {
                id: 'notification',
                title: 'Notification',
                contents: [
                    {
                        type: 'text',
                        value: 'Le nœud Notification envoie un message aux utilisateurs ou systèmes ciblés. Il peut être utilisé pour alerter une équipe, confirmer une action, ou notifier un service externe.'
                    },
                    {
                        type: 'list',
                        value: [
                            'Email — Envoie un email à un ou plusieurs destinataires avec un sujet et un corps personnalisables.',
                            'Notification in-app — Affiche une notification dans l\'interface Sardine.',
                            'Webhook sortant — Envoie une requête HTTP POST vers une URL externe.',
                        ]
                    },
                ]
            },
            {
                id: 'action',
                title: 'Action',
                contents: [
                    {
                        type: 'text',
                        value: 'Le nœud Action exécute une opération concrète sur les ressources de votre espace. C\'est le nœud le plus courant pour effectuer des modifications dans le système.'
                    },
                    {
                        type: 'list',
                        value: [
                            'Créer un document — Crée un nouveau document dans un dossier spécifié.',
                            'Déplacer un document — Déplace un document vers un autre dossier.',
                            'Archiver — Envoie un document vers la corbeille.',
                            'Assigner — Attribue un document à un utilisateur ou une équipe.',
                            'Mettre à jour les métadonnées — Modifie les propriétés d\'un document existant.',
                        ]
                    },
                ]
            },
            {
                id: 'agents',
                title: 'Agents IA',
                contents: [
                    {
                        type: 'text',
                        value: 'Les nœuds Agents IA permettent d\'intégrer de l\'intelligence artificielle dans vos flows. Ils peuvent analyser du contenu, extraire des informations, classifier des documents ou générer du texte.'
                    },
                    {
                        type: 'list',
                        value: [
                            'Classification — Classe automatiquement un document selon des catégories prédéfinies.',
                            'Extraction — Extrait des données structurées à partir d\'un document (factures, contrats, etc.).',
                            'Résumé — Génère un résumé synthétique du contenu d\'un document.',
                            'Analyse de sentiment — Évalue le ton et le sentiment d\'un texte.',
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
