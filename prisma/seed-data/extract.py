#!/usr/bin/env python3
"""Extrae la data histórica de los Google Sheets exportados a JSON para el seed.

Fuentes (en ~/Downloads, no versionadas):
  - Catálogo Personajes y Servicios.xlsx → hojas CATÁLOGO_GENERAL, BOTARGAS, REGLAS_DESCUENTO
  - Base de Datos OkiDoki.xlsx → hojas CLIENTES, EVENTOS

Genera prisma/seed-data/import.json, que consume prisma/seed.ts.
Regenerar: python3 prisma/seed-data/extract.py
"""
import json
import os
import re
import unicodedata
from datetime import datetime

HOME = os.path.expanduser("~")
CAT = os.path.join(HOME, "Downloads", "Catálogo Personajes y Servicios.xlsx")
DB = os.path.join(HOME, "Downloads", "Base de Datos OkiDoki.xlsx")
OUT = os.path.join(os.path.dirname(__file__), "import.json")

import openpyxl


def rows(path, sheet):
    wb = openpyxl.load_workbook(path, data_only=True)
    return list(wb[sheet].iter_rows(values_only=True))


def s(v):
    if v is None:
        return None
    t = str(v).strip()
    return t or None


NA = {"no aplica", "no definido", "por definir", "falta definir", "-", "nop aplica"}


def meaningful(v):
    t = s(v)
    if t is None:
        return None
    return None if t.lower() in NA else t


# ---------------------------------------------------------------------------
# Teléfonos: normaliza a E.164 CR (+506) + versión formateada "XXXX XXXX".
# Maneja floats (50670608552.0), enteros y strings con espacios.
# ---------------------------------------------------------------------------
def norm_phone(v):
    if v is None:
        return None
    if isinstance(v, float):
        v = str(int(v))
    digits = re.sub(r"[^\d]", "", str(v))
    if not digits:
        return None
    if digits.startswith("506") and len(digits) > 8:
        digits = digits[3:]
    national = digits[-8:]
    if len(national) < 8:
        return None
    return {
        "e164": "+506" + national,
        "country": "CR",
        "formatted": f"{national[:4]} {national[4:]}",
    }


def split_name(full):
    parts = (full or "").split()
    if not parts:
        return None, None
    if len(parts) == 1:
        return parts[0], ""
    return parts[0], " ".join(parts[1:])


# ---------------------------------------------------------------------------
# 1) Servicios (CATÁLOGO_GENERAL)
# ---------------------------------------------------------------------------
SERVICE_CATEGORY = {
    "Show de Magia": "Shows",
    "Botarga de Extra Lujo": "Botargas",
    "Botarga Staff": "Botargas",
    "Botarga Alquilada": "Botargas",
    "Botarguero": "Botargas",
    "Asistente de Botarga": "Botargas",
    "Animación": "Animación",
    "Pintacaritas": "Animación",
    "Inflables Staff": "Inflables",
    "Inflables Alquilado": "Inflables",
    "Cuidador de Inflable": "Inflables",
    "Toro Mecánico": "Shows",
    "Zanquero 2 patas": "Animación",
    "Zanquero 4 patas": "Animación",
    "Payasos": "Animación",
    "Micrófono": "Sonido",
    "Parlante": "Sonido",
    "Mezcladora": "Sonido",
    "Amplificación de Sonido Básica": "Sonido",
    "Amplificación de Sonido Especial": "Sonido",
    "Show de Santa": "Shows",
}


def extract_services():
    out = []
    for r in rows(CAT, "CATÁLOGO_GENERAL")[1:]:
        name = s(r[0])
        if not name or name == "Transporte":  # transporte se calcula vía Settings
            continue
        price = r[1]
        if price is None:
            continue
        out.append({
            "name": name,
            "category": SERVICE_CATEGORY.get(name, "Otros"),
            "unitPrice": float(price),
            "priceType": "FIXED",
        })
    return out


# ---------------------------------------------------------------------------
# 2) Personajes / botargas (BOTARGAS) → CatalogItem CHARACTER
# ---------------------------------------------------------------------------
def extract_characters():
    out = []
    for r in rows(CAT, "BOTARGAS")[1:]:
        name = s(r[0])
        if not name:
            continue
        tipo, franquicia, estado = s(r[1]), s(r[2]), s(r[3])
        popularidad, incluye, precio = s(r[5]), s(r[6]), r[7]
        desc_parts = []
        if franquicia:
            desc_parts.append(franquicia)
        if popularidad:
            desc_parts.append(f"Popularidad: {popularidad}")
        if incluye and incluye.lower() != "no":
            desc_parts.append(f"Incluye: {incluye}")
        tags = []
        if franquicia:
            tags.append(franquicia)
        if tipo:
            tags.append(tipo)
        out.append({
            "name": name,
            "category": "CHARACTER",
            "description": ". ".join(desc_parts) or None,
            "tags": tags,
            "hourlyPrice": float(precio) if precio is not None else None,
            "active": (estado or "").lower() == "disponible",
        })
    return out


# ---------------------------------------------------------------------------
# 3) Reglas de descuento (REGLAS_DESCUENTO) → Settings
# ---------------------------------------------------------------------------
def extract_settings():
    data = rows(CAT, "REGLAS_DESCUENTO")
    settings = {
        "quantityDiscountPercent": 15,
        "hoursDiscountPercent": 15,
        "hoursDiscountMinHours": 2,
    }
    surcharge = {}
    for r in data[1:]:
        key = s(r[0])
        if key == "cantidad":
            settings["quantityDiscountPercent"] = round(float(r[2]) * 100, 2)
        elif key == "horas":
            settings["hoursDiscountPercent"] = round(float(r[2]) * 100, 2)
            settings["hoursDiscountMinHours"] = float(r[1])
        elif key in ("Escuela", "Centro Comercial", "Empresa", "Agencia de Publicidad", "Familiar"):
            surcharge[key] = round(float(r[1]) * 100, 2)
    settings["surchargeEducationalPercent"] = surcharge.get("Escuela", 5)
    settings["surchargeCorporatePercent"] = surcharge.get("Empresa", 10)
    settings["surchargeShoppingCenterPercent"] = surcharge.get("Centro Comercial", 10)
    settings["surchargeAgencyPercent"] = surcharge.get("Agencia de Publicidad", 15)
    return settings


# ---------------------------------------------------------------------------
# 4) Clientes (CLIENTES)
# ---------------------------------------------------------------------------
CLIENT_TYPE = {
    "Familiar": "FAMILY",
    "Escolar": "EDUCATIONAL",
    "Educativo": "EDUCATIONAL",
    "Corporativo": "CORPORATE",
    "Centro Comercial": "SHOPPING_CENTER",
    "Agencia de Publicidad": "ADVERTISING_AGENCY",
}

# Normaliza variantes de nombre del responsable a un usuario canónico.
RESPONSIBLE_EMAIL = {
    "Gabriel Rodríguez Ovares": "grodriguezov@gmail.com",
    "Huberth Rodriguez Ovares": "huberth.ovares@okidoki.cr",
    "Huberth Rodríguez Ovares": "huberth.ovares@okidoki.cr",
    "Huberth Rodriguez Montero": "huberth.montero@okidoki.cr",
    "Huberth Rodríguez Montero": "huberth.montero@okidoki.cr",
}


def iso(dt):
    if isinstance(dt, datetime):
        return dt.replace(microsecond=0).isoformat() + "Z" if dt.tzinfo is None else dt.isoformat()
    return None


def extract_clients():
    out = []
    users = {}
    for r in rows(DB, "CLIENTES")[1:]:
        ext = s(r[0])
        phone = norm_phone(r[2])
        name = s(r[1])
        if not ext or (not phone and not name):
            continue
        if phone is None:  # cliente sin teléfono usable: no se puede importar (identificador natural)
            continue
        first, last = split_name(name)
        if first is None:
            first, last = "Cliente", f"({ext})"
        email = meaningful(r[3])
        company = meaningful(r[4])
        company_phone = norm_phone(r[5]) if meaningful(r[5]) else None
        source = s(r[6])
        notes_orig = s(r[7])
        old_status = s(r[8])
        ctype = CLIENT_TYPE.get(s(r[9]) or "Familiar", "FAMILY")
        first_contact = r[10]
        last_contact = r[11]
        responsible = s(r[12])

        # Notas: preservamos lo que no tiene campo propio en el modelo.
        notes = []
        if notes_orig:
            notes.append(notes_orig)
        if source:
            notes.append(f"Fuente de adquisición: {source}")
        if email:
            notes.append(f"Email: {email}")
        if old_status:
            notes.append(f"Estado histórico (Sheets): {old_status}")

        resp_email = None
        if responsible:
            resp_email = RESPONSIBLE_EMAIL.get(responsible)
            if resp_email:
                rf, rl = split_name(responsible)
                users[resp_email] = {"email": resp_email, "name": responsible}

        out.append({
            "externalId": ext,
            "firstName": first,
            "lastName": last,
            "phone": phone,
            "type": ctype,
            "companyName": company,
            "companyPhone": company_phone["e164"] if company_phone else None,
            "notes": "\n".join(notes) or None,
            "responsibleEmail": resp_email,
            "firstContactAt": iso(first_contact) or iso(last_contact),
            "lastContactAt": iso(last_contact) or iso(first_contact),
        })
    return out, list(users.values())


# ---------------------------------------------------------------------------
# 5) Eventos (EVENTOS)
# ---------------------------------------------------------------------------
FUNNEL = {
    "Evento Realizado": "COMPLETED",
    "Cotización enviada": "QUOTED",
    "En negociación": "QUOTED",
    "Pendiente de pago": "RESERVED",
    "Ya pagó abono": "CONFIRMED",
    "Cancelado": "CANCELED",
}


def event_type(tipo):
    t = (tipo or "").lower()
    if "cumpleaños" in t:
        return "CHILDREN"
    if "día del niño" in t or "dia del niño" in t or "recibimiento de clases" in t:
        return "INSTITUTIONAL"
    if "activación" in t or "activacion" in t or "mall" in t or "empresarial" in t:
        return "CORPORATE"
    return "CHILDREN"  # navideño, halloween, etc.


def parse_duration(v):
    t = s(v)
    if not t:
        return None, None
    low = t.lower()
    # casos compuestos/ambiguos → no parseamos, se conserva en notas
    if " a " in low or "," in low:
        return None, t
    total = 0.0
    matched = False
    for num, unit in re.findall(r"(\d+(?:[.,]\d+)?)\s*(horas?|h|minutos?|min|m)\b", low):
        matched = True
        n = float(num.replace(",", "."))
        total += n / 60 if unit.startswith("m") else n
    if "media" in low:
        matched = True
        total += 0.5
    if not matched:
        return None, t
    return round(total, 2), (t if abs(total) < 1e-6 else None)


def first_int(v):
    t = s(v)
    if not t:
        return None
    m = re.search(r"\d+", t)
    return int(m.group()) if m else None


def extract_events():
    out = []
    for r in rows(DB, "EVENTOS")[1:]:
        ext = r[0]
        ext = str(int(ext)) if isinstance(ext, float) else s(ext)
        client_ext = s(r[1])
        if not client_ext or not str(client_ext).startswith("C"):
            continue
        tipo = s(r[2])
        producto = s(r[3])
        fecha = r[4]
        ubic = meaningful(r[5])
        dur_raw = r[6]
        homenajeado = meaningful(r[7])
        edad = first_int(r[8])
        invitados = first_int(r[9])
        info_extra = s(r[10])
        estado = s(r[11])
        abono = r[12]
        fecha_abono = r[13]
        medio_abono = s(r[14])
        saldo = r[15]
        fecha_saldo = r[16]
        medio_saldo = s(r[17])
        testimonio = s(r[18])
        redes = r[19]
        documentos = s(r[20])
        calidad = r[21]
        comentarios = s(r[22])

        funnel = FUNNEL.get(estado or "", "PROSPECT")
        etype = event_type(tipo)
        name = f"{tipo} de {homenajeado}" if homenajeado and tipo else (tipo or f"Evento {ext}")

        event_date = None
        start_time = None
        if isinstance(fecha, datetime):
            event_date = fecha.strftime("%Y-%m-%d")
            if fecha.hour or fecha.minute:
                start_time = fecha.strftime("%H:%M")
        duration, dur_leftover = parse_duration(dur_raw)
        rating = int(calidad) if isinstance(calidad, (int, float)) and calidad else None

        notes = []
        if tipo:
            notes.append(f"Tipo de evento (Sheets): {tipo}")
        if producto:
            notes.append(f"Productos solicitados: {producto}")
        if info_extra:
            notes.append(f"Información extra: {info_extra}")
        if dur_leftover:
            notes.append(f"Duración (original): {dur_leftover}")
        if comentarios:
            notes.append(f"Comentarios: {comentarios}")
        pay = []
        if abono:
            pay.append(f"abono {int(abono)}" + (f" ({medio_abono})" if medio_abono else ""))
        if saldo:
            pay.append(f"saldo {int(saldo)}" + (f" ({medio_saldo})" if medio_saldo else ""))
        if pay:
            notes.append("Pagos (histórico): " + ", ".join(pay))
        if testimonio:
            notes.append(f"Testimonio: {testimonio}")
        if redes is True:
            notes.append("Subido a redes: sí")
        if documentos:
            notes.append(f"Documentos: {documentos}")

        out.append({
            "externalId": ext,
            "clientExternalId": client_ext,
            "name": name,
            "eventType": etype,
            "funnelStage": funnel,
            "eventDate": event_date,
            "startTime": start_time,
            "durationHours": duration,
            "venueAddress": ubic,
            "guestCount": invitados,
            "honoreeName": homenajeado,
            "honoreeAge": edad,
            "rating": rating,
            "internalNotes": "\n".join(notes) or None,
        })
    return out


def main():
    clients, users = extract_clients()
    payload = {
        "services": extract_services(),
        "characters": extract_characters(),
        "settings": extract_settings(),
        "users": users,
        "clients": clients,
        "events": extract_events(),
    }
    with open(OUT, "w", encoding="utf-8") as f:
        json.dump(payload, f, ensure_ascii=False, indent=2)
    print(f"Escrito {OUT}")
    for k, v in payload.items():
        if isinstance(v, list):
            print(f"  {k}: {len(v)}")
    # recurrencia: clientes con >1 evento COMPLETED
    from collections import Counter
    done = Counter(e["clientExternalId"] for e in payload["events"] if e["funnelStage"] == "COMPLETED")
    rec = [c for c, n in done.items() if n > 1]
    print(f"  clientes recurrentes (>1 COMPLETED): {rec or 'ninguno'}")


if __name__ == "__main__":
    main()
