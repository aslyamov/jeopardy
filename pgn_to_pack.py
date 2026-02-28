"""
pgn_to_pack.py — конвертер Lichess Study PGN → JSON-пак для Своей Игры

Использование:
    python pgn_to_pack.py input.pgn
    python pgn_to_pack.py input.pgn output.json

Правила разбора:
    [StudyName "..."]         → название пака
    [ChapterName "Тема (N)"]  → категория "Тема", стоимость N
    [FEN "..."]               → позиция (ход белых/чёрных определяется автоматически)
    { комментарий }           → ответ (приоритет над ходами)
    Ходы в конце главы        → ответ в русской нотации (если нет комментария)

Русская нотация: K→Кр, Q→Ф, R→Л, B→С, N→К, x→:
"""

import re
import json
import sys
from pathlib import Path
from collections import OrderedDict


def parse_tag(block: str, tag: str) -> str:
    m = re.search(rf'\[{tag}\s+"([^"]*)"\]', block)
    return m.group(1) if m else ''


def extract_comment(block: str) -> str:
    """Извлечь текст из { комментария } PGN."""
    m = re.search(r'\{\s*(.*?)\s*\}', block, re.DOTALL)
    return m.group(1).strip() if m else ''


def extract_moves(block: str) -> str:
    """Извлечь ходы из блока PGN (после заголовков, без комментариев)."""
    after_headers = re.sub(r'\[[^\]]*\]', '', block).strip()
    # Убрать комментарии { ... }
    no_comments = re.sub(r'\{[^}]*\}', '', after_headers).strip()
    # Убрать результат (* / 1-0 / 0-1 / 1/2-1/2)
    moves = re.sub(r'\s*(\*|1-0|0-1|1/2-1/2)\s*$', '', no_comments).strip()
    # Нормализовать пробелы
    moves = re.sub(r'\s+', ' ', moves)
    return moves


def to_russian(moves: str) -> str:
    """Конвертировать SAN в русскую шахматную нотацию."""
    piece_map = {'K': 'Кр', 'Q': 'Ф', 'R': 'Л', 'B': 'С', 'N': 'К'}
    result = []
    for ch in moves:
        if ch in piece_map:
            result.append(piece_map[ch])
        elif ch == 'x':
            result.append(':')
        else:
            result.append(ch)
    return ''.join(result)


def whose_turn(fen: str) -> str:
    parts = fen.split()
    if len(parts) >= 2:
        return 'Ход чёрных' if parts[1] == 'b' else 'Ход белых'
    return 'Найдите лучший ход'


def parse_chapter_name(chapter_name: str) -> tuple[str, int]:
    """'Материальный перевес (200)' → ('Материальный перевес', 200)"""
    m = re.match(r'^(.*?)\s*\((\d+)\)\s*$', chapter_name)
    if m:
        return m.group(1).strip(), int(m.group(2))
    return chapter_name.strip(), 100


def pgn_to_pack(pgn_path: str) -> dict:
    text = Path(pgn_path).read_text(encoding='utf-8')

    # Разбить на главы по тегу [Event ...]
    blocks = re.split(r'(?=\[Event\s+")', text)

    # Заголовок пака
    title = ''
    # OrderedDict чтобы сохранить порядок категорий
    categories: OrderedDict[str, list] = OrderedDict()

    for block in blocks:
        block = block.strip()
        if not block:
            continue

        chapter_name = parse_tag(block, 'ChapterName')
        fen = parse_tag(block, 'FEN')
        if not chapter_name or not fen:
            continue

        if not title:
            title = parse_tag(block, 'StudyName') or Path(pgn_path).stem

        cat_name, value = parse_chapter_name(chapter_name)
        comment = extract_comment(block)
        moves = extract_moves(block)

        question = whose_turn(fen)
        # Приоритет: комментарий { ... } → ходы в русской нотации → прочерк
        if comment:
            answer = comment
        elif moves:
            answer = to_russian(moves)
        else:
            answer = '—'

        categories.setdefault(cat_name, []).append({
            'value': value,
            'question': question,
            'answer': answer,
            'fen': fen,
        })

    # Сортировать вопросы внутри каждой категории по стоимости
    result_categories = [
        {
            'name': cat_name,
            'questions': sorted(questions, key=lambda q: q['value']),
        }
        for cat_name, questions in categories.items()
    ]

    return {'title': title, 'categories': result_categories}


# ── Укажи путь прямо здесь, если не хочешь передавать через командную строку ──
PGN_PATH = 'Реализация материального перевеса.pgn'
# PGN_PATH = r'C:\Users\aif97\OneDrive\Scipts\Jeopardy\Реализация материального перевеса.pgn'
# ─────────────────────────────────────────────────────────────────────────────


def main():
    if PGN_PATH:
        pgn_path = PGN_PATH
    elif len(sys.argv) >= 2:
        pgn_path = sys.argv[1]
    else:
        print('Использование: python pgn_to_pack.py input.pgn [output.json]')
        print('Или задай PGN_PATH прямо в скрипте.')
        sys.exit(1)

    if not Path(pgn_path).exists():
        print(f'Файл не найден: {pgn_path}')
        sys.exit(1)

    output_path = (
        sys.argv[2] if not PGN_PATH and len(sys.argv) > 2
        else str(Path(pgn_path).with_suffix('.json'))
    )

    pack = pgn_to_pack(pgn_path)

    if not pack['categories']:
        print('Не найдено ни одной главы с FEN.')
        sys.exit(1)

    Path(output_path).write_text(
        json.dumps(pack, ensure_ascii=False, indent=2),
        encoding='utf-8',
    )

    total_q = sum(len(c['questions']) for c in pack['categories'])
    print(f'OK: {output_path}')
    print(f'  Пак: {pack["title"]}')
    print(f'  Категорий: {len(pack["categories"])}, вопросов: {total_q}')
    for cat in pack['categories']:
        vals = [str(q['value']) for q in cat['questions']]
        print(f'  - {cat["name"]}: {", ".join(vals)}')


if __name__ == '__main__':
    main()
