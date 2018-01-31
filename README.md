Android client
==============

Cette application Android est un client pour le framework [Avatar](https://github.com/Spikharpax/Avatar-Serveur).

Comme un client fixe sur un PC Windows, Android Client est un vrai client Avatar:
- Il peut être associé à une pièce mais a l'avantage supplémentaire d'être mobile.
- Il est bi-directionnel. Il ne fait pas qu'envoyer vos règles à Avatar, il reçoit aussi ses messages sur son haut parleur. De même, il accepte les dialogues de questions/réponses (les askme) vous permettant ainsi d'effectuer de véritables conversations synchrones avec Avatar depuis votre smartphone.
- Vous pouvez le configurer pour que les dialogues soient envoyés sur votre système de son préféré, comme par exemple, votre système [Sonos](https://github.com/Spikharpax/Avatar-Plugin-SonosPlayer).
- Son menu navigateur vous permet de créer des actions sous formes de textes entièrement configurables sans aucun développement avec la possibilité d'y ajouter des paramètres de saisie. Par exemple, vous avez un plugin qui permet de gèrer la température de votre chauffage ? Créez une action de menu associée à ce plugin, ajoutez un slider pour définir la température et une liste déroulante de choix pour sélectionner la pièce où la température doit être modifié. 

<BR> 

![GitHub Logo](/images/gif_hal.gif)

<BR>

## Compatibilité
- [X] Avatar Serveur 0.1.6
- [X] OS Android >= 4.1 Jelly Bean (API 16) <= 8.1 Oreo (API 27)

**A vérifier:**<BR>
Si vous utilisez des plugins de mon github, vérifiez que vous avez la dernière version disponible.<BR>
Plugins mis à jour pour la version 0.1.6 d'Avatar:
- SonosPlayer 1.2 (Dépot prévu le 4-02)
- Freebox 1.2 (Dépot prévu le 4-02)

La compatibilité avec vos plugins existants est normalement maintenue. Néanmoins, dû aux améliorations d'Avatar 0.1.6, il peut arriver que de très légères modifications soient nécessaires. Voir le chapitre [Développement](#d%C3%A9veloppement) pour plus de précisions.

<BR><BR>

## Installation
- Depuis le Play Store sur votre smartphone, installez l'application `Avatar Android Client` ([Visualisation Browser Internet](https://play.google.com/store/apps/details?id=com.automation.home.avatar.avatarandroidclient)).
- Téléchargez et dézippez le fichier `Avatar-Plugin-Android.zip` dans un répertoire temporaire.
- Copiez le répertoire `android` dans le répertoire `Avatar-Serveur/plugins`.

<BR><BR>

## Configuration

Chaque client Android (un smartphone, une tablette) doit avoir un nom unique et doit être associé à un répertoire de liaison du même nom dans le répertoire `android/clients`.

A l'installation, un répertoire de liaison `android/clients/Android` existe pour un client `Android` déjà configuré dans les paramètres par défaut de l'application installée sur le smartphone.

**Pour changer le nom du client par défaut:**
- Renommez le répertoire `android/clients/Android` par le nom que vous avez donné dans les paramètres de l'application installée sur votre smartphone.
	- Par exemple, sur votre smartphone, vous avez changé le nom en `Salon`, renommez alors le répertoire `android/clients/Android` en `android/clients/Salon`
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

**De préférence:**<BR>
Si vous avez plusieurs client Android, définissez des ports de communication différents.


### Configuration sur le smartphone
Vous devez définir quelques paramètres supplémentaires sur le smartphone, référez-vous à l'aide en ligne dans la page d'À propos de l'application.


### Configuration du serveur Avatar

Aucune configuration n'est nécessaire, les clients mobiles sont reconnus automatiquement.<BR>
Une nouvelle fonction `Avatar.isMobile()` a été ajoutée (Avatar V 0.1.6) afin de savoir si le client est un client Android et pouvoir le gérer dans vos plugins.

```js
if (Avatar.isMobile(data.client)) {
	// Do stuff...
}
```

**Avatar.isMobile(client)**<BR>
- **true** si le client est un client mobile.
- **false** si le client n'est pas un client mobile.

#### Exemple d'utilisation de la fonction `isMobile()` dans vos plugins:
```js
var clients = Avatar.Socket.getClients();
_.map(clients, function(num) {
	// Redémarre le client Avatar si il n'est pas un mobile...
	if (!Avatar.isMobile(num.id))
		Avatar.runApp('%CD%/restart/Restart.vbs', null, num.id);
});
```


**Important:**<BR>
Plusieurs propriétés sont envoyées automatiquement avec la requète HTTP de votre règle vers le serveur Avatar. Ces propriétés peuvent être utilisées dans vos plugins. Voir le chapitre [Développement](#d%C3%A9veloppement).

<BR><BR>

## Utilisation

- Appuyez sur le bouton "REC".
- Attendez le bip de la reconnaissance vocale pour dicter une règle.
	- Le bip vous signifie que la reconnaissance est disponible. Il peut arriver dans certains cas qu'il y ait une latence dû au réseau Wi-Fi ou aux performances de votre smartphone. Dans tous les cas, si cela arrive, soyez patient. L'application se débloquera toujours d'elle-même. 
- Dictez votre règle.

Pour les dialogues AskMe, attendez **toujours** le bip de la reconnaissance vocale pour dicter vos réponses.

<BR><BR>

## Les règles	

Il existe quelques règles vocales que vous pouvez dicter sur votre smartphone. Ces règles permettent d'intérrompre l'écoute d'Avatar.

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

<BR> <BR>
	
## Les actions du navigateur
Il est possible de définir des actions "textes" dans le navigateur de l'application. Ces règles sont associéés à des règles de plugins existants **uniquement**.

Ces actions sont regroupées par menus et sont entièrement paramètrables. Ils sont définis dans le fichier `client.ini` du répertoire de chaque client qui peut ainsi avoir ses propres menus et actions.

**Point d'entré:**
```xml
"navigation_cmds" : { 
	
},
```		

<BR>
	
### Les menus
Les menus de navigateur regroupent les actions selon votre configuration, par exemple par périphériques (sons, box tv, box domotique) ou encore par pièces ('Salon', 'Chambre', etc...). 

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

<BR>

| Propriété 	| Obligatoire | Description 	|
|     :---:     | :---:   | --- 			|
| **Nom de Menu**    | Oui  | Le menu regroupant les actions dans le menu déroulant de l'application et apparaissant aussi en haut de la page de l'action.|
| **description**    | Non  | Une description apparaissant en dessous du menu dans la page de l'action.|
| **plugin**  | Non (partiel)  | Défini un plugin global pour toutes les actions du menu. Si aucun plugin n'est spécifié pour l'action du menu, alors ce plugin est utilisé.<BR>**Attention**, si ce paramètre n'est pas défini, toutes les actions du menu doivent avoir un paramètre `plugin`.|
| **client**  | Non  | Défini un client global pour l'exécution de toutes les actions du menu. Si aucun client n'est spécifié pour l'action alors ce client est utilisé. Si aucun client n'est spécifié (globalement et dans l'action) alors le nom du client Android défini dans les paramètres de l'application est utilisé. Voir le tableau [Mots-clés pour le paramètre client](#mots-cl%C3%A9s-pour-le-param%C3%A8tre-client) pour les mot-clés possibles.|
| **actions**  | Oui  | Défini les actions à exécuter pour ce menu. voir le tableau `Actions de menu` suivant pour la description d'une action.|

<BR>

### Les actions de menu
```xml
"navigation_cmds" : { 
	"Nom de Menu 1" : { 
		"description" : "Description principale du menu 1",
		"plugin" : "nom du plugin global associé au menu 1",
		"client" : "nom du client global associé au menu 1",		
		"actions" : {
			"nom de l'action 1" : {
				"order" : "Ordre de l'action dans le menu",
				"description" : "Description de l'action",
				"client" : "nom du client spécifique pour l'action",
				"plugin" : "nom du plugin spécifique pour l'action",
				"close" : "Ferme l'activité action après l'exécution",
				"command" : "nom de la commande à exécuter dans le plugin",
				"type" : "Type d'action à effectuer",
				"icon" : {
					"name" : "nom de l'icone",
					"deftype" : "drawable",
					"defpackage" : "android"
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

<BR>

| Propriété 	| Obligatoire | Description 	|
|     :---:     | :---:   | --- 			|
| **Nom de l'action**    | Oui  | Le nom de l'action à exécuter. Apparait dans le menu déroulant de l'application et aussi dans la page de l'action.|
| **order**    | Oui  | L'ordre de l'action dans le menu. Commence à 1 et s'incrémente pour chaque action du menu.<BR>Vous pouvez modifier l'ordre de la numérotation des actions, par exemple, commencer à order=3 pour la 1ere action puis order=1 pour la 2ème et order=1 pour la 3ème, ce qui compte, c'est qu'il y ait un nombre égal d'order et d'actions.|
| **description**    | Non  | Une description apparaissant en dessous de l'action dans la page de l'action.|
| **client**  | Non  | Défini un client spécifique pour l'exécution de l'action. Si aucun client n'est spécifié pour l'action, alors le client global (au niveau du menu) est utilisé. Si aucun client n'est spécifié (globalement et dans l'action) alors le nom du client Android est utilisé. Voir le tableau [Mots-clés pour le paramètre client](#mots-cl%C3%A9s-pour-le-param%C3%A8tre-client) pour les mot-clés possibles.|
| **plugin**  | Non (partiel)  | Défini un plugin spécifique pour l'action. Si aucun plugin n'est spécifié alors le plugin global (au niveau du menu) est utilisé.|
| **close**  | Non  | Comme une page peut être ouverte pour une action, par exemple pour choisir un paramètre à envoyer avec la commande, ce paramètre est à utiliser si vous désirez la fermer après son exécution et revenir dans la page principale de l'application.<BR>A utiliser aussi lorsque votre plugin envoie un message de confirmation vocale. Les message vocaux ne peuvent être vocalisés que dans la page principale, donc fermez la page Action est nécessaire dans ce cas pour vocaliser le message.<BR>|
| **command**  | Non  | Si nécessaire, les paramètres de commande du plugin pour l'action.|
| **type**  | Non  | Voir le tableau des types d'actions ci-dessous.|	
| **icon**  | Non  | Défini une image pour l'action dans le navigateur.<BR>![GitHub Logo](/images/icones.png)<BR><BR>3 paramètres sont à définir:<BR>**name:** Le nom de l'image.<BR>**deftype:** Le type d'image. Doit toujours être "drawable".<BR>**defpackage:** Package de définition de l'image. Doit toujours être "android".<BR><BR>Référez-vous au fichier `android/images/Icons.png` pour avoir une représentation des icones Android disponibles et leurs noms.|

<BR>
	

#### Types d'actions
| Type 	|  Chainable(1) | Description 	|
|     :---:   | :---:    | --- 			|
| **normal** | Non | Le paramètre par défaut si cette propriété n'est pas définie. Ce type n'affiche pas de page d'activité pour l'action. Après avoir sélectionné l'action dans le menu déroulant de l'application, celle-ci est exécutée directement une seule fois.<BR><BR>**Exemple:**<BR>&emsp;&emsp;"type": "normal"<BR><BR>|
| **activity** | Non | Affiche une page d'activité pour l'action. Un bouton "EXECUTER" permet d'exécuter l'action plusieurs fois.<BR><BR>**Exemple:**<BR>&emsp;&emsp;"type": "activity"<BR><BR>|
| **slider**   | Oui | Affiche un slider pour la sélection d'une valeur numérique. <BR>![GitHub Logo](/images/slider.png) <BR> <BR> **Définition:** <BR> slider:**<i>param</i>**@**<i>ID</i>**@**<i>size</i>**@**<i>max value</i>**@**<i>title</i>** <BR><BR> **<i>param:</i>** Le nom du paramètre pour la commande (défini dans la propriété **command** de l'action). <BR>**<i>ID:</i>** L'ID du slider dans l'activité action (**2**).<BR>**<i>size:</i>** La longueur du slider dans la page.<BR>**<i>max value:</i>** La valeur maximale d'incrémentation. <BR>**<i>title:</i>** Le titre du slider.<BR><BR>**Exemple:**<BR> Supposons la commande **<i>set_speaker</i>** de l'image ci-dessus avec un paramètre **<i>set</i>** qui définie une valeur de volume (valeur par défaut définie à 50). Le paramètre **<i>command</i>** de l'action est défini comme suit:<BR>&emsp;&emsp;"command": "command=set_speaker&set=50"<BR><BR>Pour un slider associé au paramètre **<i>set</i>**, d'ID 1, de longueur 350, d'un incrément maxi de 100 et un titre "Define volume:", le type sera défini comme suit:<BR>&emsp;&emsp;"type": "slider:set@1@350@100@Define volume:"<BR><BR>|
| **spinner**   | Oui | Affiche une liste déroulante de choix. <BR>![GitHub Logo](/images/spinner.png) <BR> <BR> **Définition:** <BR> spinner:**<i>param</i>**@**<i>ID</i>**@**<i>choice list</i>**@**<i>title</i>** <BR><BR> **<i>param:</i>** Le nom du paramètre pour la commande (défini dans la propriété **command** de l'action). <BR>**<i>ID:</i>** L'ID du spinner dans l'activité action (**2**).<BR>**<i>choice list:</i>** Les valeurs de la liste déroulante séparées par des pipes "&#124;".<BR>**<i>title:</i>** Le titre du spinner.<BR><BR>**Exemple:**<BR> Supposons la commande **<i>set_room</i>** de l'image ci-dessus avec un paramètre **<i>room</i>** qui définie une pièce (valeur par défaut "Salon"). Le paramètre **<i>command</i>** de l'action est défini comme suit:<BR>&emsp;&emsp;"command": "command=set_room&room=Salon"<BR><BR>Pour un spinner associé au paramètre **<i>room</i>**, d'ID 1, d'une liste de choix "Cuisine&#124;Salon&#124;Chambre" et un titre "Room:", le type sera défini comme suit:<BR>&emsp;&emsp;"type": "spinner:room@1@Cuisine&#124;Salon&#124;Chambre@Room:"<BR><BR>|
| **editText**   | Oui | Permet de saisir une valeur texte. <BR>![GitHub Logo](/images/editText.png) <BR> <BR> **Définition:** <BR> editText:**<i>param</i>**@**<i>ID</i>**@**<i>size</i>**@**<i>title</i>** <BR><BR> **<i>param:</i>** Le nom du paramètre pour la commande (défini dans la propriété **command** de l'action). <BR>**<i>ID:</i>** L'ID de l'editText dans l'activité action (**2**).<BR>**<i>size:</i>** La longueur du champ d'édition dans la page.<BR>**<i>title:</i>** Le titre de l'editText.<BR><BR>**Exemple:**<BR> Supposons la commande **<i>set_room</i>** de l'image ci-dessus avec un paramètre **<i>room</i>** qui définie une pièce (valeur par défaut "Salon"). Le paramètre **<i>command</i>** de l'action est défini comme suit:<BR>&emsp;&emsp;"command": "command=set_room&room=Salon"<BR><BR>Pour un editText associé au paramètre **<i>room</i>**, d'ID 1, de longueur 350 et un titre "Room:", le type sera défini comme suit:<BR>&emsp;&emsp;"type": "editText:room@1@350@Room:"<BR><BR> |

**(1):** La propriété "type" peut avoir les types chainables séparés par un caractère **"&"** vous permettant de créer une saisie de plusieurs valeurs pour une action, par exemple:
```text
"type" : "slider:<def du slider>&spinner:<def du spinner>&editText<def de l'editTExt>&spinner:<def du spinner>&slider:<def du slider>"
```		

**(2):** L'**ID**entifiant d'un type chainable est obligatoire pour repérer le widget dans l'activité action. Commence à **1** et s'incrémente pour chaque chainable ajouté dans le type. Par exemple, un 1er slider aura un ID à **1** puis le suivant aura un ID à **2** puis un editText suivant aura un ID à **3**, etc..., Exemple:
```text
"type" : "slider:setvol@**1**@350@100@Define volume:&slider:setsize@**2**@350@100@Define size:&editText:room@**3**@300@Define room"
```	

<BR>

#### Mots-clés pour le paramètre client
En plus de spécifier un nom de client Avatar, comme par exemple "Salon", il est possible de définir des mots-clés:

| client 	|  Description 	|
|     :---:     | --- 			|
| **currentRoom**    | Comme pour un client fixe sur PC Windows, "currentRoom" permet de définir l'exécution de l'action pour la pièce courante. La pièce courante est définie soit par la propriété `default.client` du fichier de propriétés d'Avatar, soit par des capteurs de présences qui modifient automatiquement la variable `Avatar.currentRoom`, soit par tout autre moyen, comme par exemple, un menu de l'application qui modifie cette variable, une règle vocale "Je suis dans le Salon", etc... Ainsi, une commande unique peut commander le même équipement dans toutes les pièces. Par exemple, une action "Allume la lumière" sera donc exécutée dans la pièce courante, indépendamment de l'endroit où vous vous trouvez.|
| **Server**    | Permet de définir l'exécution de l'action sur le serveur Avatar.|
| **N'importe quoi d'autre**    | Si vous définissez une autre valeur pour la propriété "client" de l'action, vous devrez **absolument** gérer une autre propriété à envoyer au plugin comme nom de client pour l'exécution. Voir l'exemple avec la valeur "la pièce sélectionnée" dans le chapitre ci-dessous.|


<BR> <BR>


## Quelques exemples
Vous pouvez visualiser des exemples de création de menus/actions dans le fichier client.ini du répertoire de liaison du `plugin/clients`.

Quelques exemples sont très intéressants pour connaitre le potentiel des actions et des propriétés qu'ont peut définir.<BR>
Par exemple, définir la propriété "client" avec une phrase (ex: la pièce sélectionnée) et ajouter un paramètre "setRoom" dans la requète HTTP qui recevra la valeur selectionnée qui sera traitée par le plugin.  

Chercher "la pièce sélectionnée" dans le fichier client.ini de `plugin/clients` pour voir l'exemple.

<BR> <BR>

## Développement

Les propriétés HTTP sont à utiliser dans vos plugins et sont accessibles via l'objet **data.action**

**data.client**<BR>
Contient toujours le nom du client Android qui envoie l'action.


**data.action.mobile**<BR>
Si cette variable existe et non null alors l'exécution provient d'un client Android.

```js
if (data.action.mobile)  {
	// Do stuff...
}
```

**data.action.room**<BR>
Contient la valeur de la propriété **client** définie dans les actions de menus si celle-ci est présente (non obligatoire, certains plugins ne nécessitent pas de client pour fonctionner).<BR>
Si la valeur est `currentRoom`, cette valeur est automatiquement remplacée par la pièce courante dans Avatar.
 
<BR>

Avec toute ces variables, nous pouvons "jouer" afin de récupérer tout ce que l'on veut, par exemple:<BR>
Supposons notre plugin dans lequel nous voulons connaitre:
- QUI a envoyé l'action
- QUI doit l'exécuter

**QUI a envoyé l'action** est très facile à connaitre, c'est toujours `data.client`

**QUI doit l'exécuter**<BR>
Plusieurs paramètres peuvent définir ce "QUI". En effet, ce paramètre peut provenir de différentes sources et donc ne pas forcément avoir le même nom:
- Une box domotique peut envoyer un paramètre data.action.room (ou autre chose...)
- Le traitement d'un ordre vocale d'un client fixe (dans le fichier action du plugin) peut aussi envoyer un paramètre avec un nom différent...
- Même punition avec le client mobile...

Bref, vous l'aurez compris, il est nécessaire d'utiliser toujours les mêmes noms de variables pour toutes ces sources et de bien structurer les développements.<BR>
Imaginons maintenant une fonction qui retourne le bon nom pour le **QUI doit l'exécuter**:


```js
var setClient = function (data) {
	
	// client direct (la commande provient du client et est exécutée sur le client)
	var client = data.client;	

	if (data.action.room) {
		// Client spécifique fixe (la commande provient du paramètre HTTP "client" d'un client Android)
		// Ou
		// de la fonction Avatar.ia.clientFromRule() qui retourne 'current' s'il n'y a pas de nom de client dans la règle vocale
		client = (data.action.room != 'current') ? data.action.room : (Avatar.currentRoom) ? Avatar.currentRoom : Config.default.client;
	}
	
	if (data.action.setRoom) {
		// Client spécifique non fixe dans la commande HTTP d'un client Android
		client = data.action.setRoom;
	}
	return client;
}
```

**Explication:**<BR>
- `client` est d'abord "sété" avec `data.client`, de cette façon, si c'est un client fixe qui envoie l'action à exécuter sur "ce client", on est bon...
- Ensuite, on test si il y a une variable `data.action.room` non null. Si c'est le cas, alors c'est a exécuter sur le client défini dans cette variable qui peut être la pièce courante ou un nom de pièce.
- Ensuite, on peut "jouer" avec tous les autres paramètres possibles, comme `data.action.setRoom` qui est défini dans une requète HTTP du client Android...
- Si il y en a d'autres, alors on peut continuer à tester d'autres variables...
- Et on retourne client dans la fonction principale, ce qui donne:

```js
exports.action = function(data, callback){

var client = setClient(data);

info("Commande envoyée par:", data.client);
info("Commande exécutée pour:", client);

// Je peux retourner un message vocale sur le client qui a envoyé la commande (soit data.client):
Avatar.speak("On est bon !", data.client, function(){ 
	Avatar.Speech.end(data.client);
});

// Je peux exécuter l'action sur le client désigné (soit client):
switchLight (client, "On");

callback();	
}
```

<BR> 
Vous pouvez retrouver des exemples de gestion des clients (les QUI) dans les plugins `generic` et `SonosPlayer`.

<BR> <BR>

## Versions

Version 0.1.0 - 13/01/2018
- Initial version