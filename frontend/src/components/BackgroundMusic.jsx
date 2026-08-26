import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Volume2, VolumeX, SkipForward, Volume1 } from 'lucide-react';

const POPULAR_ANIME_NAMES = [
  // Top tier & Hit Iconiche
  'Code Geass',                     // OP1 "COLORS" (FLOW)
  'Death Note',                     // OP1 "The WORLD" / OP2 "What's up, people?!"
  'Oshi no Ko',                     // OP1 "Idol" (YOASOBI)
  'Re:Zero',                        // OP1 "Redo" / OP3 "Realize"
  'Attack on Titan',                // "Guren no Yumiya" / "The Rumbling"
  'Darling in the Franxx',          // OP1 "KISS OF DEATH" (Mika Nakashima)
  'Chainsaw Man',                   // OP1 "KICK BACK" (Kenshi Yonezu)
  'No Game No Life',                // OP1 "This Game" (Konomi Suzuki)
  'Sword Art Online',               // OP1 "Crossing Field" (LiSA)
  'Tokyo Ghoul',                    // OP1 "Unravel" (TK)
  'DanDaDan',                       // OP1 "Otonoke" (Creepy Nuts)
  'Demon Slayer',                   // OP1 "Gurenge" / "Zankyosouka"

  // Masterpiece delle posizioni intermedie e banger assoluti
  'Parasyte',                       // OP1 "Let Me Hear" (Fear, and Loathing in Las Vegas)
  'Erased',                         // OP1 "Re:Re:" (Asian Kung-Fu Generation)
  'Death Parade',                   // OP1 "Flyers" (BRADIO)
  'The Promised Neverland',         // OP1 "Touch Off" (UVERworld)
  'Psycho-Pass',                    // OP1 "abnormalize" (Ling Tosite Sigure)
  'Kakegurui',                      // OP1 "Deal with the devil"
  'Angel Beats!',                   // OP1 "My Soul, Your Beats!"
  'Noragami',                       // OP2 "Kyouran Hey Kids!!" (THE ORAL CIGARETTES)
  'Bocchi the Rock!',               // OP1 "Seishun Complex"
  'One Punch Man',                  // OP1 "THE HERO !!" (JAM Project)

  // Perle musicali dalle posizioni più basse della lista
  'Deadman Wonderland',             // OP1 "One Reason" (Fade) - Rock pazzesco
  'Yamada-kun and the Seven Witches',// OP1 "Kuchizuke Diamond" (WEAVER)
  'Domestic Girlfriend',            // OP1 "Crying for Rain" (Minami) - Capolavoro assoluto
  'Gokukoku no Brynhildr',          // OP1 "BRYNHILDR IN THE DARKNESS" - Synth metal strumentale
  'Highschool of the Dead',         // OP1 "HIGHSCHOOL OF THE DEAD" (Kishida Kyoudan)
  'Miss Kobayashis Dragon Maid',     // OP1 "Aozora no Rhapsody" (fhána)

  // Classici Immortali & Inni Pop
  'Neon Genesis Evangelion',      // "A Cruel Angel's Thesis" - L'opening per eccellenza
  'Fullmetal Alchemist Brotherhood', // OP1 "Again" (YUI) - Un pezzo iconico del J-Rock
  'Cowboy Bebop',                 // "Tank!" (SEATBELTS) - Capolavoro Jazz unico
  'Steins;Gate',                  // OP1 "Hacking to the Gate" (Kanako Ito)

  // Banger Moderni & Bop Virali
  'Jujutsu Kaisen',               // OP1 "Kaikai Kitan" (Eve) / OP3 "SPECIALZ" (King Gnu)
  'Mob Psycho 100',               // OP1 "99" / OP2 "99.9" (MOB CHOIR) - Visivamente e musicalmente incredibile
  'Bleach',                       // OP1 "Asterisk" / OP13 "Ranbu no Melody"
  'Naruto Shippuden',             // OP3 "Blue Bird" / OP16 "Silhouette" (KANA-BOON)
  'JoJo\'s Bizarre Adventure',    // OP2 "Bloody Stream" / OP7 "Great Days"

  // Capolavori Visivi e Sonori
  'Vinland Saga',                 // OP1 "Mukanjyo" (Survive Said The Prophet)
  'Fate/stay night Unlimited Blade Works', // OP2 "Brave Shine" (Aimer)
  'Soul Eater',                   // OP1 "Resonance" (T.M.Revolution)
  'Cyberpunk Edgerunners',        // OP1 "This Fffire" (Franz Ferdinand)
  'Bakemonogatari',               // OP4 "Renai Circulation" - Uno dei brani più virali di sempre
  'Tokyo Revengers'               // OP1 "Cry Baby" (Official HIGE DANdism)
];

export default function BackgroundMusic() {
  const audioRef = useRef(new Audio());

  const [playlist, setPlaylist] = useState([]);
  const [currentTrack, setCurrentTrack] = useState(null);
  const [isEnabled, setIsEnabled] = useState(() => localStorage.getItem('bg_music') !== 'false');
  
  const [volume, setVolume] = useState(() => {
    const savedVolume = localStorage.getItem('bg_volume');
    return savedVolume !== null ? parseFloat(savedVolume) : 0.12;
  });

  const volumeRef = useRef(volume);
  const isEnabledRef = useRef(isEnabled);
  const playlistRef = useRef(playlist);
  
  const lastAnimeRef = useRef(null);
  const playedHistoryRef = useRef([]);

  useEffect(() => {
    volumeRef.current = volume;
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  useEffect(() => { isEnabledRef.current = isEnabled; }, [isEnabled]);
  useEffect(() => { playlistRef.current = playlist; }, [playlist]);

  // Pulizia memoria audio allo smontaggio del componente
  useEffect(() => {
    const audio = audioRef.current;
    return () => {
      audio.pause();
      audio.removeAttribute('src');
      audio.load();
    };
  }, []);

  // Selezione intelligente del brano
  const playRandomTrack = useCallback((tracksToUse) => {
    const list = tracksToUse || playlistRef.current;
    if (!list || list.length === 0) return;

    let candidates = list.filter(track => {
      const isSameAnime = track.anime === lastAnimeRef.current;
      const isRecentlyPlayed = playedHistoryRef.current.includes(track.url);
      return !isSameAnime && !isRecentlyPlayed;
    });

    if (candidates.length === 0) {
      candidates = list.filter(track => track.anime !== lastAnimeRef.current);
    }

    if (candidates.length === 0) {
      candidates = list;
    }

    const randomIndex = Math.floor(Math.random() * candidates.length);
    const selected = candidates[randomIndex];

    lastAnimeRef.current = selected.anime;
    playedHistoryRef.current = [...playedHistoryRef.current.slice(-7), selected.url];

    const audio = audioRef.current;
    audio.pause();
    audio.currentTime = 0;

    setCurrentTrack(selected);
    audio.src = selected.url;
    audio.volume = volumeRef.current;

    if (isEnabledRef.current) {
      audio.play().catch(() => {});
    }
  }, []);

  // Caricamento playlist
  useEffect(() => {
    let isMounted = true;

    const loadPlaylist = async () => {
      const shuffled = [...POPULAR_ANIME_NAMES].sort(() => 0.5 - Math.random());
      const selectedTitles = shuffled.slice(0, 15);

      const fetchPromises = selectedTitles.map(title =>
        fetch(
          `https://api.animethemes.moe/anime?q=${encodeURIComponent(title)}&include=animethemes.song,animethemes.animethemeentries.videos`
        )
          .then(res => (res.ok ? res.json() : null))
          .catch(() => null)
      );

      const results = await Promise.allSettled(fetchPromises);
      const extractedTracks = [];

      results.forEach(result => {
        if (result.status === 'fulfilled' && result.value?.anime?.length > 0) {
          const animeData = result.value.anime[0];
          const validThemes = (animeData.animethemes || []).slice(0, 2);

          validThemes.forEach(theme => {
            const videoLink = theme.animethemeentries?.[0]?.videos?.[0]?.link;
            if (videoLink) {
              extractedTracks.push({
                title: theme.song?.title || 'Sigla',
                anime: animeData.name,
                type: theme.type || 'OP',
                url: videoLink
              });
            }
          });
        }
      });

      if (isMounted && extractedTracks.length > 0) {
        setPlaylist(extractedTracks);
        playRandomTrack(extractedTracks);
      }
    };

    loadPlaylist();

    return () => {
      isMounted = false;
    };
  }, [playRandomTrack]);

  useEffect(() => {
    const audio = audioRef.current;

    const handleEnded = () => playRandomTrack();
    const handleError = (e) => {
      console.warn("Errore di riproduzione, passaggio alla traccia successiva:", e);
      playRandomTrack();
    };

    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('error', handleError);

    return () => {
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('error', handleError);
    };
  }, [playRandomTrack]);

  // Gestione stato di abilitazione/pausa manuale
  useEffect(() => {
    const audio = audioRef.current;
    if (isEnabled && audio.src) {
      audio.play().catch(() => {});
    } else {
      audio.pause();
    }
  }, [isEnabled]);

  const toggleMusic = () => {
    const newState = !isEnabled;
    setIsEnabled(newState);
    localStorage.setItem('bg_music', String(newState));
  };

  const handleVolumeChange = (e) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    localStorage.setItem('bg_volume', String(newVolume));

    if (!isEnabled && newVolume > 0) {
      setIsEnabled(true);
      localStorage.setItem('bg_music', 'true');
    }
  };

  const renderVolumeIcon = () => {
    if (!isEnabled || volume === 0) {
      return <VolumeX className="w-5 h-5 text-slate-500" />;
    }
    if (volume < 0.5) {
      return <Volume1 className="w-5 h-5 text-indigo-400" />;
    }
    return <Volume2 className="w-5 h-5 animate-pulse text-indigo-400" />;
  };

  return (
    <div className="fixed bottom-5 left-5 z-50 flex items-center gap-3 bg-slate-900/90 border border-slate-700/80 p-2 pr-4 rounded-full backdrop-blur-md shadow-xl text-white">
      <button
        onClick={toggleMusic}
        className="p-2 rounded-full hover:bg-slate-800 transition text-indigo-400"
        title={isEnabled ? "Muta audio" : "Attiva audio"}
      >
        {renderVolumeIcon()}
      </button>

      <div className="flex items-center gap-2">
        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={isEnabled ? volume : 0}
          onChange={handleVolumeChange}
          className="w-16 h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-500 hover:accent-indigo-400 transition"
          title={`Volume: ${Math.round(volume * 100)}%`}
        />
      </div>

      {currentTrack && (
        <div className="max-w-[140px] truncate text-xs border-l border-slate-700/80 pl-3">
          <p className="font-semibold text-slate-200 truncate">{currentTrack.title}</p>
          <p className="text-[10px] text-slate-400 truncate">{currentTrack.anime} ({currentTrack.type})</p>
        </div>
      )}

      <button
        onClick={() => playRandomTrack()}
        disabled={playlist.length === 0}
        className="p-1 text-slate-400 hover:text-white transition disabled:opacity-40"
        title="Prossima canzone"
      >
        <SkipForward className="w-4 h-4" />
      </button>
    </div>
  );
}