# Client mobile Android

Chaque client Android (un smartphone, une tablette) doit avoir un nom unique et doit être associé à un répertoire de liaison du même nom dans le répertoire android/clients.

A l'installation, un répertoire de liaison android/clients/Android existe déjà pour un client _Android_ configuré comme nom de client par défaut dans l'application de votre smartphone. Il n'y a donc aucune configuration à faire pour une 1ère utilisation.

### Changer le nom du client par défaut:
**Vous pouvez le faire directement depuis le smartphone:**
- Changer le nom du client sur le smartphone va automatiquement modifier le nom du répertoire de liaison et ajouter les bons paramètres de communication dans le fichier client.ini.

**Vous pouvez aussi le faire manuellement:**
- Renommez le répertoire android/clients/Android par le nom que vous avez donné dans les paramètres de l'application installée sur votre smartphone.
	- Par exemple, sur votre smartphone, vous avez changé le nom en Salon, renommez alors le répertoire android/clients/Android en android/clients/Salon
- Ouvrez le fichier client.ini dans le répertoire de votre client et modifiez la propriété client par le nom que vous avez donné.

### Ajouter un autre client:
- Copiez un répertoire de liaison disponible dans android/clients/ en le nom que vous avez donné dans les paramètres de l'application installée sur votre smartphone. 
	- Par exemple, un répertoire de liaison Salon pour un client Salon existe, copiez alors ce répertoire android/clients/Salon en android/clients/Cuisine (en supposant que votre nouveau client Android s'appelle Cuisine).
- Ouvrez le fichier client.ini dans le répertoire de votre nouveau client et modifiez la propriété client par le nom que vous lui avez donné.

### Configuration sur le smartphone Android

La configuration est automatique.

Après avoir démarré le Serveur Avatar et lancé l'application sur votre téléphone:
- Déplacez-vous dans les paramètres de l'application
- Cliquez sur le bouton à coté de l'adresse IP du serveur Avatar (pour une 1ère connexion, l'adresse IP est XXX.XXX.XXX.XXX). L'application: 
	- Recherche le serveur Avatar sur le réseau
	- Configure automatiquement les paramètres de connexion sur le Serveur: 
		- Le nom du client (Champ "Nom du client" dans les paramètres de l'application)
		- L'adresse IP du client (Champ "Mon IP adresse" dans les paramètres de l'application)
		- Le port de communication du client (Champ "Mon IP PORT" dans les paramètres de l'application)
	- Configure automatiquement le paramètre de connexion sur le client:
    	- L'adresse IP du Serveur

Lorsque vous modifiez le nom du client Android dans les paramètres de l'application sur votre smartphone ou que son adresse IP a changée (adressage DHCP) ou encore si vous changez de serveur Avatar, utilisez ce bouton pour remettre à jour automatiquement les propriétés de l'application dans le serveur Avatar et les paramètres dans l'application Android.

Vous devez aussi définir quelques paramètres supplémentaires sur le smartphone, référez-vous aux paramètres de l'application ou à l'aide en ligne dans la page d'À propos de l'application.

### Utilisation
- Appuyez sur le bouton "REC".
- Attendez le bip de la reconnaissance vocale pour dicter une règle. 
	- Le bip vous signifie que la reconnaissance est disponible. Il peut arriver dans certains cas qu'il y ait une latence dû au réseau Wi-Fi ou aux performances de votre smartphone. Dans tous les cas, si cela arrive, soyez patient. L'application se débloquera toujours d'elle-même.
- Dictez votre règle.

Pour les dialogues AskMe, attendez toujours le bip de la reconnaissance vocale pour dicter vos réponses.


### Les règles

Il existe quelques règles vocales que vous pouvez dicter sur votre smartphone. Ces règles permettent d'intérrompre l'écoute d'Avatar.

Les règles sont définies dans le fichier _android/android.prop_ et dans le tableau "rules":
```js
"rules" : {
			"listen_stop" : "Je ne t'ai rien demandé","non rien","désolé rien"
			"listen_stop_gracefully": "merci Sarah"
	}
```

Avatar vous répond les phrases pré-définies pour chaque client dans le fichier _client.ini_ associé:
```js
"locale" : {
		"fr-FR" : {
			"stop_listen" : "d'accord|reçu|pas d'soucis",
			"stop_listen_gracefully": "avec plaisir|à ton service"
		}
	}	
```


### Les actions du navigateur

Il est possible de définir des actions "textes" dans le navigateur de l'application. Ces règles sont associéés à des règles de plugins existants uniquement.

Ces actions sont regroupées par menus et sont entièrement paramètrables. Ils sont définis dans le fichier _client.ini_ du répertoire de chaque client qui peut ainsi avoir ses propres menus et actions.

Pour plus d'information sur la création des actions de menu, référez-vous à la [documentation wiki](https://github.com/Spikharpax/Avatar-Plugin-Android#les-actions-du-navigateur) du projet Github
<br><br><br><br>