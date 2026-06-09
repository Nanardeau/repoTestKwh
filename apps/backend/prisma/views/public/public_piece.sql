SELECT
  p.idpiece,
  p.idbat,
  b.nombat,
  p.nompiece,
  p.nomgenerique,
  p.surface,
  p.codescap,
  p.exterieure,
  p.numlot,
  p.asset,
  p.identitelocalelocataire AS locatairepiece,
  locataire.identite AS identitelocataire,
  locataire.denomination AS nomlocataire,
  p.chauffageoperat,
  p.refroidissementoperat,
  p.logistiquefroidoperat,
  p.froidcommercialoperat,
  p.conservationoperat,
  p.etage,
  l.typeexploitation,
  l.identitelocaleproprio AS propriolot,
  proprietaire.identite AS identiteproprio,
  proprietaire.denomination AS nomproprio,
  l.identitelocale AS faitpartiede,
  dans.identite,
  dans.denomination,
  l.qualiteassujettie,
  l.typelot
FROM
  (
    (
      (
        (
          (
            _piece p
            JOIN _lot l ON (
              (
                ((p.numlot) :: text = (l.numlot) :: text)
                AND ((p.idbat) :: text = (l.idbat) :: text)
              )
            )
          )
          LEFT JOIN _client locataire ON (
            (
              p.identitelocalelocataire = locataire.identitelocale
            )
          )
        )
        LEFT JOIN _client proprietaire ON (
          (
            l.identitelocaleproprio = proprietaire.identitelocale
          )
        )
      )
      LEFT JOIN _client dans ON ((l.identitelocale = dans.identitelocale))
    )
    LEFT JOIN _batiment b ON (((l.idbat) :: text = (b.idbat) :: text))
  );