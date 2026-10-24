// Starter catalogue so the library works offline on first open.
// Format: Title|Year|Director(s) separated by ";"|subgenres separated by ","
// The full catalogue (tens of thousands of titles) comes from Settings > Import catalogue.
window.HL = window.HL || {};
HL.SEED_VERSION = 1;
HL.SEED = `
The Cabinet of Dr. Caligari|1920|Robert Wiene|psychological,surreal
Nosferatu|1922|F. W. Murnau|vampire,gothic
Häxan|1922|Benjamin Christensen|witchcraft
The Phantom of the Opera|1925|Rupert Julian|gothic
Dracula|1931|Tod Browning|vampire,gothic
Frankenstein|1931|James Whale|gothic,sci-fi
Vampyr|1932|Carl Theodor Dreyer|vampire,surreal
Freaks|1932|Tod Browning|psychological
The Mummy|1932|Karl Freund|creature,supernatural
White Zombie|1932|Victor Halperin|zombie
Island of Lost Souls|1932|Erle C. Kenton|sci-fi,body
The Old Dark House|1932|James Whale|gothic
King Kong|1933|Merian C. Cooper;Ernest B. Schoedsack|creature
The Invisible Man|1933|James Whale|sci-fi
The Black Cat|1934|Edgar G. Ulmer|gothic,satanic
Bride of Frankenstein|1935|James Whale|gothic
The Wolf Man|1941|George Waggner|werewolf
Cat People|1942|Jacques Tourneur|psychological,creature
I Walked with a Zombie|1943|Jacques Tourneur|zombie,gothic
The Seventh Victim|1943|Mark Robson|satanic,psychological
The Body Snatcher|1945|Robert Wise|gothic
Dead of Night|1945|Alberto Cavalcanti;Charles Crichton;Basil Dearden;Robert Hamer|anthology
The Thing from Another World|1951|Christian Nyby|sci-fi,creature
House of Wax|1953|André De Toth|gothic
Them!|1954|Gordon Douglas|creature,sci-fi
Creature from the Black Lagoon|1954|Jack Arnold|creature
Godzilla|1954|Ishirō Honda|creature
Les Diaboliques|1955|Henri-Georges Clouzot|psychological
Invasion of the Body Snatchers|1956|Don Siegel|sci-fi,social
Night of the Demon|1957|Jacques Tourneur|supernatural,witchcraft
The Curse of Frankenstein|1957|Terence Fisher|gothic
Dracula|1958|Terence Fisher|vampire,gothic
The Fly|1958|Kurt Neumann|sci-fi,body
The Blob|1958|Irvin Yeaworth|creature,sci-fi
House on Haunted Hill|1959|William Castle|haunted-house
The Tingler|1959|William Castle|creature
Eyes Without a Face|1960|Georges Franju|body,psychological
Psycho|1960|Alfred Hitchcock|slasher,psychological
Peeping Tom|1960|Michael Powell|psychological,slasher
Black Sunday|1960|Mario Bava|gothic,witchcraft
Village of the Damned|1960|Wolf Rilla|sci-fi
House of Usher|1960|Roger Corman|gothic
Jigoku|1960|Nobuo Nakagawa|supernatural,surreal
The Innocents|1961|Jack Clayton|haunted-house,psychological
The Pit and the Pendulum|1961|Roger Corman|gothic
Carnival of Souls|1962|Herk Harvey|supernatural,psychological
What Ever Happened to Baby Jane?|1962|Robert Aldrich|psychological
Night of the Eagle|1962|Sidney Hayers|witchcraft
The Birds|1963|Alfred Hitchcock|creature
The Haunting|1963|Robert Wise|haunted-house,psychological
Black Sabbath|1963|Mario Bava|anthology
The Masque of the Red Death|1964|Roger Corman|gothic
Onibaba|1964|Kaneto Shindo|folk
Kwaidan|1964|Masaki Kobayashi|anthology,supernatural
Blood and Black Lace|1964|Mario Bava|giallo
Hush... Hush, Sweet Charlotte|1964|Robert Aldrich|psychological
Repulsion|1965|Roman Polanski|psychological
Seconds|1966|John Frankenheimer|psychological,sci-fi
The Plague of the Zombies|1966|John Gilling|zombie
Kill, Baby, Kill|1966|Mario Bava|gothic,supernatural
Spider Baby|1967|Jack Hill|comedy
Rosemary's Baby|1968|Roman Polanski|satanic,psychological
Night of the Living Dead|1968|George A. Romero|zombie,social
Witchfinder General|1968|Michael Reeves|folk
Kuroneko|1968|Kaneto Shindo|supernatural
Hour of the Wolf|1968|Ingmar Bergman|psychological,surreal
The Devil Rides Out|1968|Terence Fisher|satanic
Targets|1968|Peter Bogdanovich|psychological
The Cremator|1969|Juraj Herz|psychological
The Bird with the Crystal Plumage|1970|Dario Argento|giallo
Valerie and Her Week of Wonders|1970|Jaromil Jireš|surreal,vampire
Let's Scare Jessica to Death|1971|John D. Hancock|psychological,vampire
The Blood on Satan's Claw|1971|Piers Haggard|folk,satanic
A Bay of Blood|1971|Mario Bava|giallo,slasher
Daughters of Darkness|1971|Harry Kümel|vampire
The Abominable Dr. Phibes|1971|Robert Fuest|comedy,gothic
The Last House on the Left|1972|Wes Craven|exploitation
Sisters|1972|Brian De Palma|psychological
Don't Torture a Duckling|1972|Lucio Fulci|giallo
Tombs of the Blind Dead|1972|Amando de Ossorio|zombie,gothic
Horror Express|1972|Eugenio Martín|sci-fi,creature
Death Line|1972|Gary Sherman|cannibal
Tales from the Crypt|1972|Freddie Francis|anthology
Blacula|1972|William Crain|vampire
Don't Look Now|1973|Nicolas Roeg|psychological,supernatural
The Exorcist|1973|William Friedkin|possession
The Wicker Man|1973|Robin Hardy|folk
Ganja & Hess|1973|Bill Gunn|vampire
Messiah of Evil|1973|Willard Huyck;Gloria Katz|cosmic,zombie
The Legend of Hell House|1973|John Hough|haunted-house
Theatre of Blood|1973|Douglas Hickox|comedy,slasher
Black Christmas|1974|Bob Clark|slasher
The Texas Chain Saw Massacre|1974|Tobe Hooper|slasher,survival
It's Alive|1974|Larry Cohen|creature
Deathdream|1974|Bob Clark|zombie,psychological
Deep Red|1975|Dario Argento|giallo
Jaws|1975|Steven Spielberg|creature,survival
Shivers|1975|David Cronenberg|body
Picnic at Hanging Rock|1975|Peter Weir|psychological
The Stepford Wives|1975|Bryan Forbes|social,sci-fi
Carrie|1976|Brian De Palma|supernatural
The Omen|1976|Richard Donner|satanic
Burnt Offerings|1976|Dan Curtis|haunted-house
The Tenant|1976|Roman Polanski|psychological
Alice, Sweet Alice|1976|Alfred Sole|slasher
Who Can Kill a Child?|1976|Narciso Ibáñez Serrador|survival
The House with Laughing Windows|1976|Pupi Avati|giallo
Suspiria|1977|Dario Argento|witchcraft
The Hills Have Eyes|1977|Wes Craven|survival,cannibal
House|1977|Nobuhiko Obayashi|haunted-house,surreal
Eraserhead|1977|David Lynch|surreal,body
Rabid|1977|David Cronenberg|body
Martin|1977|George A. Romero|vampire,psychological
Halloween|1978|John Carpenter|slasher
Dawn of the Dead|1978|George A. Romero|zombie,social
Invasion of the Body Snatchers|1978|Philip Kaufman|sci-fi
Magic|1978|Richard Attenborough|psychological
Alien|1979|Ridley Scott|sci-fi,creature
Phantasm|1979|Don Coscarelli|supernatural,surreal
The Brood|1979|David Cronenberg|body,psychological
The Amityville Horror|1979|Stuart Rosenberg|haunted-house
Tourist Trap|1979|David Schmoeller|slasher
Zombi 2|1979|Lucio Fulci|zombie
Nosferatu the Vampyre|1979|Werner Herzog|vampire
Salem's Lot|1979|Tobe Hooper|vampire
The Shining|1980|Stanley Kubrick|psychological,haunted-house
Friday the 13th|1980|Sean S. Cunningham|slasher
The Fog|1980|John Carpenter|supernatural
The Changeling|1980|Peter Medak|haunted-house
City of the Living Dead|1980|Lucio Fulci|zombie,supernatural
Inferno|1980|Dario Argento|witchcraft
Maniac|1980|William Lustig|slasher
Cannibal Holocaust|1980|Ruggero Deodato|found-footage,cannibal,exploitation
Altered States|1980|Ken Russell|body,sci-fi
The Evil Dead|1981|Sam Raimi|supernatural,possession
An American Werewolf in London|1981|John Landis|werewolf,comedy
The Howling|1981|Joe Dante|werewolf
The Beyond|1981|Lucio Fulci|supernatural,zombie
Possession|1981|Andrzej Żuławski|psychological,body
My Bloody Valentine|1981|George Mihalka|slasher
Scanners|1981|David Cronenberg|sci-fi,body
Dead & Buried|1981|Gary Sherman|zombie
The Burning|1981|Tony Maylam|slasher
Wolfen|1981|Michael Wadleigh|werewolf
Ghost Story|1981|John Irvin|supernatural
The Thing|1982|John Carpenter|sci-fi,creature,body
Poltergeist|1982|Tobe Hooper|haunted-house
Creepshow|1982|George A. Romero|anthology
Cat People|1982|Paul Schrader|creature
Basket Case|1982|Frank Henenlotter|creature
Halloween III: Season of the Witch|1982|Tommy Lee Wallace|folk,sci-fi
The Slumber Party Massacre|1982|Amy Holden Jones|slasher
Tenebrae|1982|Dario Argento|giallo
The Entity|1982|Sidney J. Furie|supernatural
Videodrome|1983|David Cronenberg|body,surreal
The Dead Zone|1983|David Cronenberg|psychological
Christine|1983|John Carpenter|supernatural
Cujo|1983|Lewis Teague|creature,survival
Sleepaway Camp|1983|Robert Hiltzik|slasher
The Hunger|1983|Tony Scott|vampire
A Nightmare on Elm Street|1984|Wes Craven|slasher,supernatural
Gremlins|1984|Joe Dante|creature,comedy
C.H.U.D.|1984|Douglas Cheek|creature
Children of the Corn|1984|Fritz Kiersch|folk
The Company of Wolves|1984|Neil Jordan|werewolf,gothic
Silent Night, Deadly Night|1984|Charles E. Sellier Jr.|slasher
Re-Animator|1985|Stuart Gordon|comedy,body
The Return of the Living Dead|1985|Dan O'Bannon|zombie,comedy
Fright Night|1985|Tom Holland|vampire
Day of the Dead|1985|George A. Romero|zombie
Phenomena|1985|Dario Argento|giallo
Lifeforce|1985|Tobe Hooper|vampire,sci-fi
Demons|1985|Lamberto Bava|possession
The Stuff|1985|Larry Cohen|sci-fi,comedy
The Fly|1986|David Cronenberg|body,sci-fi
Aliens|1986|James Cameron|sci-fi,creature
From Beyond|1986|Stuart Gordon|cosmic,body
Henry: Portrait of a Serial Killer|1986|John McNaughton|psychological
Night of the Creeps|1986|Fred Dekker|comedy,zombie
The Hitcher|1986|Robert Harmon|survival
Hellraiser|1987|Clive Barker|body,supernatural
Near Dark|1987|Kathryn Bigelow|vampire
The Lost Boys|1987|Joel Schumacher|vampire,comedy
Evil Dead II|1987|Sam Raimi|possession,comedy
Prince of Darkness|1987|John Carpenter|cosmic,satanic
The Gate|1987|Tibor Takács|supernatural
Angel Heart|1987|Alan Parker|satanic,psychological
The Stepfather|1987|Joseph Ruben|psychological
Opera|1987|Dario Argento|giallo
A Nightmare on Elm Street 3: Dream Warriors|1987|Chuck Russell|slasher,supernatural
The Monster Squad|1987|Fred Dekker|creature,comedy
Child's Play|1988|Tom Holland|slasher
The Blob|1988|Chuck Russell|creature,body
Killer Klowns from Outer Space|1988|Stephen Chiodo|comedy,sci-fi
Beetlejuice|1988|Tim Burton|comedy,supernatural
Night of the Demons|1988|Kevin Tenney|possession
Dead Ringers|1988|David Cronenberg|psychological,body
The Serpent and the Rainbow|1988|Wes Craven|zombie
Pumpkinhead|1988|Stan Winston|creature,folk
The Vanishing|1988|George Sluizer|psychological
Pet Sematary|1989|Mary Lambert|supernatural
Tetsuo: The Iron Man|1989|Shinya Tsukamoto|body,surreal
Santa Sangre|1989|Alejandro Jodorowsky|psychological,surreal
Society|1989|Brian Yuzna|body,social
Misery|1990|Rob Reiner|psychological
Jacob's Ladder|1990|Adrian Lyne|psychological
Tremors|1990|Ron Underwood|creature,comedy
Arachnophobia|1990|Frank Marshall|creature
Night of the Living Dead|1990|Tom Savini|zombie
The Exorcist III|1990|William Peter Blatty|possession
Nightbreed|1990|Clive Barker|creature
The Silence of the Lambs|1991|Jonathan Demme|psychological
The People Under the Stairs|1991|Wes Craven|social,comedy
Candyman|1992|Bernard Rose|supernatural,social
Braindead|1992|Peter Jackson|zombie,comedy
Bram Stoker's Dracula|1992|Francis Ford Coppola|vampire,gothic
Army of Darkness|1992|Sam Raimi|comedy
Ghostwatch|1992|Lesley Manning|found-footage,supernatural
Body Snatchers|1993|Abel Ferrara|sci-fi
Cronos|1993|Guillermo del Toro|vampire
In the Mouth of Madness|1994|John Carpenter|cosmic
Wes Craven's New Nightmare|1994|Wes Craven|slasher
Interview with the Vampire|1994|Neil Jordan|vampire,gothic
Cemetery Man|1994|Michele Soavi|zombie,comedy
Se7en|1995|David Fincher|psychological
The Day of the Beast|1995|Álex de la Iglesia|satanic,comedy
Tales from the Hood|1995|Rusty Cundieff|anthology,social
Scream|1996|Wes Craven|slasher
From Dusk till Dawn|1996|Robert Rodriguez|vampire
The Frighteners|1996|Peter Jackson|supernatural,comedy
The Craft|1996|Andrew Fleming|witchcraft
Funny Games|1997|Michael Haneke|home-invasion
Cube|1997|Vincenzo Natali|sci-fi,survival
Event Horizon|1997|Paul W. S. Anderson|cosmic,sci-fi
Mimic|1997|Guillermo del Toro|creature
Cure|1997|Kiyoshi Kurosawa|psychological
Perfect Blue|1997|Satoshi Kon|psychological,animated
I Know What You Did Last Summer|1997|Jim Gillespie|slasher
Ringu|1998|Hideo Nakata|supernatural
The Faculty|1998|Robert Rodriguez|sci-fi
Audition|1999|Takashi Miike|psychological
The Blair Witch Project|1999|Daniel Myrick;Eduardo Sánchez|found-footage,witchcraft
The Sixth Sense|1999|M. Night Shyamalan|supernatural
Sleepy Hollow|1999|Tim Burton|gothic
Ravenous|1999|Antonia Bird|cannibal
Stir of Echoes|1999|David Koepp|supernatural
American Psycho|2000|Mary Harron|psychological,comedy
Final Destination|2000|James Wong|supernatural
Ginger Snaps|2000|John Fawcett|werewolf,body
Shadow of the Vampire|2000|E. Elias Merhige|vampire
Uzumaki|2000|Higuchinsky|cosmic,body
Pulse|2001|Kiyoshi Kurosawa|supernatural
The Others|2001|Alejandro Amenábar|haunted-house
The Devil's Backbone|2001|Guillermo del Toro|supernatural,gothic
Session 9|2001|Brad Anderson|psychological
Frailty|2001|Bill Paxton|psychological
Ichi the Killer|2001|Takashi Miike|exploitation
Dark Water|2002|Hideo Nakata|supernatural
28 Days Later|2002|Danny Boyle|zombie
The Ring|2002|Gore Verbinski|supernatural
Ju-On: The Grudge|2002|Takashi Shimizu|supernatural
May|2002|Lucky McKee|psychological
Dog Soldiers|2002|Neil Marshall|werewolf
Signs|2002|M. Night Shyamalan|sci-fi
Cabin Fever|2002|Eli Roth|body
The Eye|2002|Oxide Pang Chun;Danny Pang|supernatural
A Tale of Two Sisters|2003|Kim Jee-woon|psychological,supernatural
High Tension|2003|Alexandre Aja|slasher
House of 1000 Corpses|2003|Rob Zombie|slasher
The Texas Chainsaw Massacre|2003|Marcus Nispel|slasher
Shaun of the Dead|2004|Edgar Wright|zombie,comedy
Dawn of the Dead|2004|Zack Snyder|zombie
Saw|2004|James Wan|psychological
Shutter|2004|Banjong Pisanthanakun;Parkpoom Wongpoom|supernatural
Calvaire|2004|Fabrice Du Welz|survival
Three... Extremes|2004|Fruit Chan;Park Chan-wook;Takashi Miike|anthology
The Descent|2005|Neil Marshall|survival,creature
Hostel|2005|Eli Roth|exploitation
Wolf Creek|2005|Greg McLean|survival
The Devil's Rejects|2005|Rob Zombie|exploitation
Noroi: The Curse|2005|Kōji Shiraishi|found-footage,supernatural
The Exorcism of Emily Rose|2005|Scott Derrickson|possession
Slither|2006|James Gunn|creature,comedy,body
The Host|2006|Bong Joon-ho|creature
Pan's Labyrinth|2006|Guillermo del Toro|supernatural
Behind the Mask: The Rise of Leslie Vernon|2006|Scott Glosserman|slasher,comedy
Silent Hill|2006|Christophe Gans|supernatural
Severance|2006|Christopher Smith|comedy,survival
Them|2006|David Moreau;Xavier Palud|home-invasion
The Orphanage|2007|J. A. Bayona|haunted-house
[REC]|2007|Jaume Balagueró;Paco Plaza|found-footage,zombie
The Mist|2007|Frank Darabont|creature,cosmic
Inside|2007|Alexandre Bustillo;Julien Maury|home-invasion
Paranormal Activity|2007|Oren Peli|found-footage,haunted-house
Trick 'r Treat|2007|Michael Dougherty|anthology
1408|2007|Mikael Håfström|supernatural
Teeth|2007|Mitchell Lichtenstein|body,comedy
Frontier(s)|2007|Xavier Gens|survival
Let the Right One In|2008|Tomas Alfredson|vampire
Martyrs|2008|Pascal Laugier|psychological,exploitation
The Strangers|2008|Bryan Bertino|home-invasion
Pontypool|2008|Bruce McDonald|zombie
Cloverfield|2008|Matt Reeves|found-footage,creature
Eden Lake|2008|James Watkins|survival
Lake Mungo|2008|Joel Anderson|found-footage,supernatural
The Children|2008|Tom Shankland|survival
Drag Me to Hell|2009|Sam Raimi|supernatural
The House of the Devil|2009|Ti West|satanic
Antichrist|2009|Lars von Trier|psychological
Jennifer's Body|2009|Karyn Kusama|possession,comedy
Thirst|2009|Park Chan-wook|vampire
Zombieland|2009|Ruben Fleischer|zombie,comedy
Triangle|2009|Christopher Smith|psychological
Splice|2009|Vincenzo Natali|sci-fi,body
The Loved Ones|2009|Sean Byrne|survival
Amer|2009|Hélène Cattet;Bruno Forzani|giallo
Black Swan|2010|Darren Aronofsky|psychological
Tucker & Dale vs. Evil|2010|Eli Craig|comedy,slasher
Insidious|2010|James Wan|supernatural
I Saw the Devil|2010|Kim Jee-woon|psychological
Let Me In|2010|Matt Reeves|vampire
Trollhunter|2010|André Øvredal|found-footage,creature
Stake Land|2010|Jim Mickle|vampire
Bedevilled|2010|Jang Cheol-soo|psychological
Kill List|2011|Ben Wheatley|folk
You're Next|2011|Adam Wingard|home-invasion
The Innkeepers|2011|Ti West|haunted-house
Attack the Block|2011|Joe Cornish|creature,comedy
Grave Encounters|2011|The Vicious Brothers|found-footage
Absentia|2011|Mike Flanagan|supernatural
The Cabin in the Woods|2012|Drew Goddard|comedy,cosmic
Sinister|2012|Scott Derrickson|supernatural
Berberian Sound Studio|2012|Peter Strickland|psychological,giallo
V/H/S|2012|Adam Wingard;David Bruckner;Ti West;Glenn McQuaid;Joe Swanberg;Radio Silence|anthology,found-footage
Excision|2012|Richard Bates Jr.|body,psychological
The Lords of Salem|2012|Rob Zombie|witchcraft
The Conjuring|2013|James Wan|haunted-house
Evil Dead|2013|Fede Álvarez|possession
Under the Skin|2013|Jonathan Glazer|sci-fi
We Are What We Are|2013|Jim Mickle|cannibal
Stoker|2013|Park Chan-wook|psychological
Oculus|2013|Mike Flanagan|supernatural
The Babadook|2014|Jennifer Kent|psychological,supernatural
It Follows|2014|David Robert Mitchell|supernatural
What We Do in the Shadows|2014|Jemaine Clement;Taika Waititi|vampire,comedy
A Girl Walks Home Alone at Night|2014|Ana Lily Amirpour|vampire
Goodnight Mommy|2014|Veronika Franz;Severin Fiala|psychological
Housebound|2014|Gerard Johnstone|haunted-house,comedy
The Taking of Deborah Logan|2014|Adam Robitel|found-footage,possession
Starry Eyes|2014|Kevin Kölsch;Dennis Widmyer|body,satanic
Creep|2014|Patrick Brice|found-footage
Honeymoon|2014|Leigh Janiak|sci-fi,body
Spring|2014|Justin Benson;Aaron Moorhead|creature
The Witch|2015|Robert Eggers|folk,witchcraft
Green Room|2015|Jeremy Saulnier|survival
The Invitation|2015|Karyn Kusama|psychological
Crimson Peak|2015|Guillermo del Toro|gothic,haunted-house
Krampus|2015|Michael Dougherty|folk,comedy
Bone Tomahawk|2015|S. Craig Zahler|cannibal,survival
The Blackcoat's Daughter|2015|Osgood Perkins|possession
Hell House LLC|2015|Stephen Cognetti|found-footage
Hush|2016|Mike Flanagan|home-invasion
Train to Busan|2016|Yeon Sang-ho|zombie
The Wailing|2016|Na Hong-jin|possession,folk
Raw|2016|Julia Ducournau|cannibal,body
Under the Shadow|2016|Babak Anvari|supernatural
10 Cloverfield Lane|2016|Dan Trachtenberg|psychological,sci-fi
Don't Breathe|2016|Fede Álvarez|home-invasion
The Autopsy of Jane Doe|2016|André Øvredal|supernatural,witchcraft
The Conjuring 2|2016|James Wan|haunted-house
Ouija: Origin of Evil|2016|Mike Flanagan|possession
A Dark Song|2016|Liam Gavin|supernatural
The Eyes of My Mother|2016|Nicolas Pesce|psychological
I Am the Pretty Thing That Lives in the House|2016|Osgood Perkins|haunted-house
The Love Witch|2016|Anna Biller|witchcraft
The Void|2016|Jeremy Gillespie;Steven Kostanski|cosmic,body
Hounds of Love|2016|Ben Young|psychological
Terrifier|2016|Damien Leone|slasher
Better Watch Out|2016|Chris Peckover|home-invasion,comedy
Get Out|2017|Jordan Peele|social
It|2017|Andy Muschietti|supernatural
The Killing of a Sacred Deer|2017|Yorgos Lanthimos|psychological
It Comes at Night|2017|Trey Edward Shults|psychological,survival
Gerald's Game|2017|Mike Flanagan|psychological
mother!|2017|Darren Aronofsky|psychological,surreal
Thelma|2017|Joachim Trier|supernatural
A Ghost Story|2017|David Lowery|supernatural
The Ritual|2017|David Bruckner|folk,creature
The Endless|2017|Justin Benson;Aaron Moorhead|cosmic
Revenge|2017|Coralie Fargeat|exploitation,survival
One Cut of the Dead|2017|Shinichiro Ueda|zombie,comedy
Ghost Stories|2017|Jeremy Dyson;Andy Nyman|anthology,supernatural
Hagazussa|2017|Lukas Feigelfeld|folk,witchcraft
Tigers Are Not Afraid|2017|Issa López|supernatural
Veronica|2017|Paco Plaza|possession
Satan's Slaves|2017|Joko Anwar|supernatural
Happy Death Day|2017|Christopher Landon|slasher,comedy
Hereditary|2018|Ari Aster|supernatural,satanic
A Quiet Place|2018|John Krasinski|creature,survival
Annihilation|2018|Alex Garland|sci-fi,cosmic,body
Mandy|2018|Panos Cosmatos|surreal
Suspiria|2018|Luca Guadagnino|witchcraft
Halloween|2018|David Gordon Green|slasher
Climax|2018|Gaspar Noé|psychological
In Fabric|2018|Peter Strickland|supernatural,comedy
Apostle|2018|Gareth Evans|folk
Cam|2018|Daniel Goldhaber|psychological
Tumbbad|2018|Rahi Anil Barve|folk
Us|2019|Jordan Peele|social
Midsommar|2019|Ari Aster|folk
The Lighthouse|2019|Robert Eggers|psychological,surreal
Doctor Sleep|2019|Mike Flanagan|supernatural
Ready or Not|2019|Matt Bettinelli-Olpin;Tyler Gillett|comedy,survival
Color Out of Space|2019|Richard Stanley|cosmic
Saint Maud|2019|Rose Glass|psychological
La Llorona|2019|Jayro Bustamante|supernatural,social
Impetigore|2019|Joko Anwar|folk
The Lodge|2019|Veronika Franz;Severin Fiala|psychological
The Platform|2019|Galder Gaztelu-Urrutia|social,sci-fi
Vivarium|2019|Lorcan Finnegan|sci-fi,psychological
The Vigil|2019|Keith Thomas|supernatural
The Hole in the Ground|2019|Lee Cronin|supernatural
Crawl|2019|Alexandre Aja|creature,survival
Scary Stories to Tell in the Dark|2019|André Øvredal|supernatural
His House|2020|Remi Weekes|haunted-house,social
The Invisible Man|2020|Leigh Whannell|psychological,sci-fi
Relic|2020|Natalie Erika James|haunted-house,psychological
Host|2020|Rob Savage|found-footage,supernatural
Possessor|2020|Brandon Cronenberg|sci-fi,body
The Dark and the Wicked|2020|Bryan Bertino|supernatural
Freaky|2020|Christopher Landon|slasher,comedy
Titane|2021|Julia Ducournau|body
Malignant|2021|James Wan|supernatural,body
Lamb|2021|Valdimar Jóhannsson|folk
The Night House|2021|David Bruckner|supernatural,psychological
Censor|2021|Prano Bailey-Bond|psychological
Candyman|2021|Nia DaCosta|supernatural,social
Fear Street: 1994|2021|Leigh Janiak|slasher
Last Night in Soho|2021|Edgar Wright|psychological,supernatural
The Black Phone|2021|Scott Derrickson|supernatural
The Medium|2021|Banjong Pisanthanakun|found-footage,possession
X|2022|Ti West|slasher
Pearl|2022|Ti West|psychological,slasher
Nope|2022|Jordan Peele|creature,sci-fi
Barbarian|2022|Zach Cregger|creature
Smile|2022|Parker Finn|supernatural,psychological
Bodies Bodies Bodies|2022|Halina Reijn|slasher,comedy
Men|2022|Alex Garland|folk,body
Speak No Evil|2022|Christian Tafdrup|psychological
Skinamarink|2022|Kyle Edward Ball|surreal,supernatural
Hatching|2022|Hanna Bergholm|body,creature
Terrifier 2|2022|Damien Leone|slasher
Incantation|2022|Kevin Ko|found-footage,supernatural
You Won't Be Alone|2022|Goran Stolevski|folk,witchcraft
Huesera: The Bone Woman|2022|Michelle Garza Cervera|body,supernatural
Nanny|2022|Nikyatu Jusu|supernatural,social
Deadstream|2022|Joseph Winter;Vanessa Winter|found-footage,comedy
Watcher|2022|Chloe Okuno|psychological
Fresh|2022|Mimi Cave|cannibal,comedy
The Menu|2022|Mark Mylod|comedy,social
Bones and All|2022|Luca Guadagnino|cannibal
Talk to Me|2023|Danny Philippou;Michael Philippou|possession
Evil Dead Rise|2023|Lee Cronin|possession
Infinity Pool|2023|Brandon Cronenberg|sci-fi,body
When Evil Lurks|2023|Demián Rugna|possession
Late Night with the Devil|2023|Cameron Cairnes;Colin Cairnes|found-footage,possession
Beau Is Afraid|2023|Ari Aster|psychological,surreal
Birth/Rebirth|2023|Laura Moss|body,sci-fi
Strange Darling|2023|JT Mollner|slasher
The Substance|2024|Coralie Fargeat|body
Longlegs|2024|Osgood Perkins|satanic,psychological
I Saw the TV Glow|2024|Jane Schoenbrun|psychological,surreal
Nosferatu|2024|Robert Eggers|vampire,gothic
Heretic|2024|Scott Beck;Bryan Woods|psychological
Exhuma|2024|Jang Jae-hyun|supernatural,folk
In a Violent Nature|2024|Chris Nash|slasher
Oddity|2024|Damian Mc Carthy|supernatural
The First Omen|2024|Arkasha Stevenson|satanic,body
Cuckoo|2024|Tilman Singer|creature,psychological
Abigail|2024|Matt Bettinelli-Olpin;Tyler Gillett|vampire,comedy
Alien: Romulus|2024|Fede Álvarez|sci-fi,creature
Smile 2|2024|Parker Finn|supernatural,psychological
MaXXXine|2024|Ti West|slasher
Companion|2025|Drew Hancock|sci-fi,comedy
The Monkey|2025|Osgood Perkins|supernatural,comedy
Sinners|2025|Ryan Coogler|vampire,social
28 Years Later|2025|Danny Boyle|zombie
Weapons|2025|Zach Cregger|supernatural
Bring Her Back|2025|Danny Philippou;Michael Philippou|possession,psychological
Together|2025|Michael Shanks|body
Final Destination Bloodlines|2025|Zach Lipovsky;Adam B. Stein|supernatural
Frankenstein|2025|Guillermo del Toro|gothic
Dangerous Animals|2025|Sean Byrne|creature,survival
The Conjuring: Last Rites|2025|Michael Chaves|haunted-house
Black Phone 2|2025|Scott Derrickson|supernatural
Good Boy|2025|Ben Leonberg|haunted-house
`;
