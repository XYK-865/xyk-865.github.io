// Add a director once, then reference their id from each film. Genres describe films, not a fixed label for their director.
window.SPIKE_FILM_LIBRARY={
 directors:[{id:'mary-harron',name:'玛丽·哈伦',englishName:'Mary Harron',nationality:'加拿大',intro:'加拿大导演、编剧，创作涉及电影与剧集。',source:'https://lionsgatelimited.com/pages/mary-harron'}],
 films:[{id:'american-psycho',title:'美国精神病人',englishTitle:'American Psycho',year:2000,directorId:'mary-harron',styles:['惊悚','黑色幽默','社会讽刺'],cover:'assets/films/american-psycho.webp',href:'american-psycho.html',status:'draft',summary:'封面与影片资料已收录，观后文章待补充。',sources:[{title:'BFI · 影片资料',url:'https://player.bfi.org.uk/rentals/film/watch-american-psycho-2000-online'},{title:'AFI · 类型与风格介绍',url:'https://www.afi.com/news/halloween-movie-guide/'}]}]
};
