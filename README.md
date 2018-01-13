Android client
==============

Ce plugin est un client Android pour le framework [Avatar](https://github.com/Spikharpax/Avatar-Serveur) 

Un client Android pour Avatar est bi-directionnel. Il envoie vos règles à Avatar et reçoit les messages de confirmation sur son haut parleur. Il peut aussi recevoir des demandes vocales directes provenants de plugins et attendre une réponse. Il gère même les dialogues de questions/réponses vous permettant ainsi d'effectuer de véritables conversations avec Avatar depuis votre smartphone exactement de la même façon qu'un client fixe sur un PC Windows.


## Installation
- Installez l'application Avatar depuis l'APP Store sur votre smartphone
- Téléchargez et dézippez le fichier `Avatar-Plugin-Android.zip` dans un répertoire temporaire
- Copiez le répertoire `android` dans le répertoire `Avatar-Serveur/plugins`

## Configuration

Chaque client Android (un smartphone, une tablette) doit avoir un nom unique et doit être associé à un répertoire de liaison du même nom dans le répertoire `android/clients`.

A l'installation, un répertoire de liaison `android/clients/Android` existe pour le client `Android` défini dans les paramètres par défaut de l'application installée sur le smartphone.

**Pour changer le nom du client par défaut:**
- Renommez le répertoire `android/clients/Android` par le nom que vous avez donné dans les paramètres de l'application installée sur votre smartphone.
	- Par exemple, vous avez changé le nom en `Salon`, renommez alors le répertoire `android/clients/Android` par `android/clients/Salon`
- Ouvrez le fichier `client.ini` dans le répertoire de votre client et modifiez la propriété `client` par le nom que vous avez donné.

**Pour ajouter un autre client:**
- Copiez un répertoire de liaison disponible dans `android/clients/` en le nom que vous avez donné dans les paramètres de l'application installée sur votre smartphone.
	- Par exemple, un répertoire de liaison `Salon` pour un client `Salon` existe, copiez alors ce répertoire `android/clients/Salon` en `android/clients/Cuisine` (en supposant que votre nouveau client Android s'appelle `Cuisine`).
- Ouvrez le fichier `client.ini` dans le répertoire de votre nouveau client et modifiez la propriété `client` par le nom que vous lui avez donné.

**Dans les 2 cas**:
- Récupérez l'adresse IP et le Port de communication dans les paramètres de l'application sur votre smartphone.
- Ajoutez-les dans le fichier `client.ini` du répertoire de votre client.

```xml
"http" : {
	"remote" : {
		"ip"    : "192.168.1.9",
		"port"  : 8765
	},
```

### Configuration sur le smartphone
Vous devez définir quelques paramètres sur le smartphone, référez-vous à l'aide en ligne dans la page d'À propos de l'application.


## Les règles	

Les règles sont définies dans le fichier `Avatar-Serveur/plugins/android/android.prop` et dans le tableau "rules":
- "listen_stop" : Les règles simples lorsque vous avez déclenché l'écoute sur votre smartphone et que vous voulez l'intérrompre.
	- Par défaut : "Je ne t'ai rien demandé","non rien","désolé rien"
- "listen_stop_gracefully" : Les règles gracieuses lorsque vous avez déclenché l'écoute sur votre smartphone et que vous voulez l'intérrompre.
	- Par défaut : "merci Sarah"

Avatar vous répond les phrases pré-définies pour chaque client dans le fichier client.ini associé. 
```xml
"locale" : {
		"fr-FR" : {
			"stop_listen" : "d'accord|reçu|pas d'soucis",
			"stop_listen_gracefully": "avec plaisir|à ton service"
		}
	}	
```	
	
	
## Les actions du menu de l'application	
Il est possible de définir des actions "textes" dans le menu navigateur de l'application. Ces actions sont entièrement paramètrables depuis le serveur.

Les actions sont au format JSON et sont définies dans le fichier `client.ini` du répertoire du client, ainsi chaque client peut avoir son propre menu d'actions.

**Point d'entré:**
```xml
"navigation_cmds" : { 
	
},
```		
	
### Le menu
```xml
"navigation_cmds" : { 
	"Nom de Menu 1" : { 
		"description" : "Description principale du menu 1",
		"plugin" : "nom du plugin global associé au menu 1",
		"client" : "nom du client global associé au menu 1",		
		"actions" : {
			
			
		}
	},
	"Nom de Menu 2" : { 
		....
		....
	}
},
```		

| Propriété 	| Obligatoire | Description 	|
|     :---:     | :---:   | --- 			|
| **Nom de Menu**    | Oui  | Le menu regroupant les actions dans le menu déroulant de l'application et apparaissant aussi en haut de la page de l'action.|
| **description**    | Non  | Une description apparaissant en dessous du menu dans la page de l'action.|
| **plugin**  | Non  | Défini un plugin global pour toutes les actions du menu. Si aucun plugin n'est spécifié pour l'action du menu, alors ce plugin est utilisé. **Attention**, si ce paramètre n'est pas défini, toutes les actions du menu doivent avoir un paramètre `plugin`.|
| **client**  | Non  | Défini un client global pour l'exécution de toutes les actions du menu. Si aucun client n'est spécifié pour l'action alors ce client est utilisé. Si aucun client n'est spécifié (globalement et dans l'action) alors le nom du client Android défini dans les paramètres de l'application est utilisé. Voir le tableau `Mots-clés pour le paramètre client` pour les mot-clés possibles. **Rappel:** Avatar est une application clients/serveur, par conséquent, toutes les actions sont associées à un client.|
| **actions**  | Oui  | Défini les actions à exécuter pour ce menu. voir le tableau `Actions de menu` suivant pour la description d'une action.|



### Les actions de menu
```xml
"navigation_cmds" : { 
	"Nom de Menu 1" : { 
		"description" : "Description principale du menu 1",
		"plugin" : "nom du plugin global associé au menu 1",
		"client" : "nom du client global associé au menu 1",		
		"actions" : {
			"nom de l'action 1" : {
				"description" : "Description de l'action",
				"client" : "nom du client spécifique pour l'action",
				"plugin" : "nom du plugin spécifique pour l'action",
				"command" : "nom de la commande à exécuter dans le plugin",
				"type" : "Type d'action à effectuer",
				"icon" : {
					"name" : "nom de l'icone image pour l'action dans le menu",
					"deftype" : "type d'icone",
					"defpackage" : "package de définition de l'icone"
				}
			},
			"nom de l'action 2" : {
				....
				....
			}
		}
	},
	....
},
```		


| Propriété 	| Obligatoire | Description 	|
|     :---:     | :---:   | --- 			|
| **Nom de l'action**    | Oui  | Le nom de l'action à exécuter. Apparait dans le menu déroulant de l'application et aussi dans la page de l'action.|
| **description**    | Non  | Une description apparaissant en dessous de l'action dans la page de l'action.|
| **client**  | Non  | Défini un client spécifique pour l'exécution de l'action. Si aucun client n'est spécifié pour l'action, alors le client global (au niveau du menu) est utilisé. Si aucun client n'est spécifié (globalement et dans l'action) alors le nom de ce client Android est utilisé. Voir le tableau `Mots-clés pour le paramètre client` pour les mot-clés possibles. **Rappel:** Avatar est une application clients/serveur, par conséquent, toutes les actions sont associées à un client.|
| **plugin**  | Non  | Défini un plugin spécifique pour l'action. Si aucun plugin n'est spécifié alors le plugin global (au niveau du menu) est utilisé.|
| **command**  | Non  | Si necessaire, la commande à exécuter dans le plugin pour l'action.|
| **type**  | Non  | Voir le tableau des types d'actions ci-dessous.|
| **icon**  | Oui  | |

```text
```	
	

#### Types d'actions:
| Type 	|  Chainable(1) | Description 	|
|     :---:   | :---:    | --- 			|
| **normal** | Non | Le paramètre par défaut si cette propriété n'est pas définie. Ce type n'affiche pas de page d'activité pour l'action. Après avoir sélectionné l'action dans le menu déroulant de l'application, celle-ci est exécutée directement une seule fois.|
| **activity** | Non | Affiche une page d'activité pour l'action. Un bouton "EXECUTER" permet d'exécuter l'action plusieurs fois.|
| **slider**   | Oui | |
| **spinner**   | Oui |
| **editText**   | Oui |

##### (1): La propriété "type" peut avoir les types chainables séparés par un caractère "&" plusieurs fois dans sa valeur, par exemple:
```text
"type" : "slider:<def du slider>&spinner:<def du spinner>&editText<def de l'editTExt>&spinner:<def du spinner>&slider:<def du slider>"
```		

```text
```	

#### Mots-clés pour le paramètre client:
| client 	|  Description 	|
|     :---:     | --- 			|
| **currentRoom**    | Permet de définir l'exécution de l'action pour la pièce courante. La pièce courante est définie soit par la propriété `default.client` du fichier de propriétés d'Avatar, soit par des capteurs de présences qui modifient automatiquement la variable `Avatar.currentRoom`, soit par tout autre moyen, comme par exemple, un menu de l'application qui modifie cette variable, une règle vocale "Je suis dans le Salon", etc... Ainsi, une commande unique peut commander le même équipement dans toutes les pièces. Par exemple, une action "Allume la lumière" sera donc exécutée dans la pièce courante.|
| **Server**    | Permet de définir l'exécution de l'action sur le serveur Avatar.|


```text
```	 

## Versions

Version 1.0 - 13/01/2018
- Initial version