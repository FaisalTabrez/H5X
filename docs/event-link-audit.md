# Events Attended link audit

Checked 4 November 2026. Four event arrows previously pointed to profile pages that surfaced posts during public research. Those profile URLs were not suitable event destinations. They have been replaced with specific event-post links read from LinkedIn's visible UI and checked against the post body and author.

| Event | Verified post and context |
|---|---|
| ContextCon Deccan CTF | [Vasanthadithya’s original event recap](https://www.linkedin.com/feed/update/urn:li:activity:7512221237364957184/). Confirms second place at IIIT Hyderabad; the linked YC follow-up supplies the date, 12 hours and 7,657 points. One full-team photograph retained from the original post; the smaller scoreboard group photograph was removed at the team’s request. |
| z0d1ak CTF Finals | [Vasanthadithya’s original finals recap](https://www.linkedin.com/feed/update/urn:li:activity:7508138676044935169/). Confirms second place, $500 and VIT Vellore; the official CTFtime record gives 19 September 2026. Award and community photographs copied from the original post. |
| GDG DevFest Hyderabad 2026 | [Sai Bhavani Yedla's recap, reposted by Geethika](https://www.linkedin.com/feed/update/urn:li:activity:7520188249689182208/). Names Vasanthadithya, Geethika, Akshay and Faisal. Replaces Poojitha Vollala's profile. |
| GDG DevFest Hyderabad 2025 | [Geethika's original recap](https://www.linkedin.com/posts/sai-geethika-yedla_devfest-devfesthyd-gdghyd-ugcPost-7394755523390337024-_zv6/). Names Vasanthadithya, Faisal and Sai Bhavani alongside the author; describes the Novotel venue and workshops. Replaces Bevin Bijoy's profile. |
| SHIELD Conclave 2026 | [Geethika's existing post](https://www.linkedin.com/posts/sai-geethika-yedla_shield2026-tgcsb-telanganapolice-activity-7429204319503261696-QYGY). The event, TGICCC venue and participants match. Retained. |
| Team1 Builders Connect | [Vasanthadithya's existing post](https://www.linkedin.com/posts/vasanthadithya-mundrathi-84a54031a_team1-hyderabaddao-avalanche-activity-7463970170252713984-jjgL). Names the DevX venue and Geethika. Retained. |
| India AI Impact Summit 2026 | [Shruthi Kodari's event post](https://www.linkedin.com/feed/update/urn:li:activity:7433903114052648960/). Names Vasanthadithya, Srinath and Geethika at Bharat Mandapam. Replaces the author's profile landing page. |
| YC office hours | [Vasanthadithya's H5X update](https://www.linkedin.com/feed/update/urn:li:activity:7521651457448751104/). Describes the twenty-minute call with Jon Xu after Deccan CTF and names the teammates. Replaces Faisal's profile landing page. |
| Telangana Assistive Technology Summit | [Srinath Manda's existing post](https://www.linkedin.com/feed/update/urn%3Ali%3Aactivity%3A7413575402776014848/). Names Geethika, Beacon Vision, T-Hub and 4 January 2026. Retained. |
| PizzaDAO × Hyderabad DAO | [Vasanthadithya's Team1 recap](https://www.linkedin.com/posts/vasanthadithya-mundrathi-84a54031a_team1-hyderabaddao-avalanche-activity-7463970170252713984-jjgL). Explicitly recalls the earlier PizzaDAO gathering; this is shared context, not a separate PizzaDAO post. Retained. |

All ten records are maintained in `data/h5x.json`. The homepage event preview uses those same records. `npm run check:site` rejects LinkedIn profile/search URLs in the event-source field. Team profile links elsewhere on the site remain appropriate for member profiles and are not affected by this rule.

Tracking parameters have been removed. LinkedIn can still request sign-in depending on the visitor's session; the destinations are specific event posts rather than unrelated member profiles.

## Chronology and hackathon credits

Events are sorted newest first by their ISO date in the fifth array field. `null` marks an undated entry; those entries remain at the end. Dates are event dates rather than recap publication dates wherever established.

- YC office hours: the original post says the call happened "Today". Its activity timestamp is 29 October 2026 UTC / 30 October IST. The ordering key uses 29 October; the display keeps the precision at October 2026 rather than claiming an exact local call date.
- DevFest 2026: 24 October, verified against the [GDG organizer listing](https://gdg.community.dev/events/details/google-gdg-hyderabad-presents-devfest-hyderabad-2026/).
- Deccan CTF: 2 October 2026, stated in the YC follow-up linked above.
- z0d1ak Finals: 19 September 2026, official CTFtime record linked from the team results.
- India AI Impact Summit: 16–21 February 2026, verified against the [government's post-event account](https://www.pib.gov.in/PressReleasePage.aspx?PRID=2234343&lang=1&reg=1). Sorting uses the opening day; attendance is not claimed for every day.
- SHIELD: 5 February 2026, verified against the [organizer agenda](https://www.shieldconference.com/conclaveagenda).
- Assistive Technology Summit: 4 January 2026, stated in the original post.
- DevFest 2025: 12 October, verified against the [GDG organizer recap](https://www.linkedin.com/posts/gdghyd_devfesthyd-gdghyderabad-devfest2025-activity-7411066697782054912-N9N4).
- Team1 and PizzaDAO: no exact event date established in the retained shared source. Both are explicitly undated; the source establishes PizzaDAO happened before Team1, so that relative order is preserved.

The [original Agents, Everywhere announcement by Sai Geethika Yedla](https://www.linkedin.com/feed/update/urn:li:activity:7504251435417739264/) names Vasanthadithya Mundrathi, Faisal Tabrez and Akshay Kumar Akkapally as her teammates for 12 September 2026. All four names, including the author, now appear in the hackathon credit, and the source points directly to her post. Smart India Hackathon was removed at the team's request.

Event photo previews were removed at the team's request. The three Deccan/z0d1ak photographs remain in Gallery with original-post credits.
