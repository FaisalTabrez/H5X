# Events Attended link audit

Checked 4 November 2026. Four event arrows previously pointed to profile pages that surfaced posts during public research. Those profile URLs were not suitable event destinations. They have been replaced with specific event-post links read from LinkedIn's visible UI and checked against the post body and author.

| Event | Verified post and context |
|---|---|
| GDG DevFest Hyderabad 2026 | [Sai Bhavani Yedla's recap, reposted by Geethika](https://www.linkedin.com/feed/update/urn:li:activity:7520188249689182208/). Names Vasanthadithya, Geethika, Akshay and Faisal. Replaces Poojitha Vollala's profile. |
| GDG DevFest Hyderabad 2025 | [Geethika's original recap](https://www.linkedin.com/posts/sai-geethika-yedla_devfest-devfesthyd-gdghyd-ugcPost-7394755523390337024-_zv6/). Names Vasanthadithya, Faisal and Sai Bhavani alongside the author; describes the Novotel venue and workshops. Replaces Bevin Bijoy's profile. |
| SHIELD Conclave 2026 | [Geethika's existing post](https://www.linkedin.com/posts/sai-geethika-yedla_shield2026-tgcsb-telanganapolice-activity-7429204319503261696-QYGY). The event, TGICCC venue and participants match. Retained. |
| Team1 Builders Connect | [Vasanthadithya's existing post](https://www.linkedin.com/posts/vasanthadithya-mundrathi-84a54031a_team1-hyderabaddao-avalanche-activity-7463970170252713984-jjgL). Names the DevX venue and Geethika. Retained. |
| India AI Impact Summit 2026 | [Shruthi Kodari's event post](https://www.linkedin.com/feed/update/urn:li:activity:7433903114052648960/). Names Vasanthadithya, Srinath and Geethika at Bharat Mandapam. Replaces the author's profile landing page. |
| YC office hours | [Vasanthadithya's H5X update](https://www.linkedin.com/feed/update/urn:li:activity:7521651457448751104/). Describes the twenty-minute call with Jon Xu after Deccan CTF and names the teammates. Replaces Faisal's profile landing page. |
| Telangana Assistive Technology Summit | [Srinath Manda's existing post](https://www.linkedin.com/feed/update/urn%3Ali%3Aactivity%3A7413575402776014848/). Names Geethika, Beacon Vision, T-Hub and 4 January 2026. Retained. |
| PizzaDAO × Hyderabad DAO | [Vasanthadithya's Team1 recap](https://www.linkedin.com/posts/vasanthadithya-mundrathi-84a54031a_team1-hyderabaddao-avalanche-activity-7463970170252713984-jjgL). Explicitly recalls the earlier PizzaDAO gathering; this is shared context, not a separate PizzaDAO post. Retained. |

All eight records are maintained in `data/h5x.json`. The homepage event preview uses those same records. `npm run check:site` rejects LinkedIn profile/search URLs in the event-source field. Team profile links elsewhere on the site remain appropriate for member profiles and are not affected by this rule.

Tracking parameters have been removed. LinkedIn can still request sign-in depending on the visitor's session; the destinations are specific event posts rather than unrelated member profiles.
