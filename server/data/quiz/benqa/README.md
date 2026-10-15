# BEnQA questions

Multiple-choice science and maths questions from Bangladesh middle and high
school exams, with parallel **English and Bangla** text. One CSV per class and
subject (`8th-Math.csv`, `10th-Physics.csv`, …).

- Source: https://github.com/sheikhshafayat/BEnQA (`data/BEnQA`, commit `b8cd623`)
- Columns: `English Question, Bengali Question, A, B, C, D, A Bn, B Bn, C Bn, D Bn, Correct Answer`
- The upstream repository has no license file. Check you may use the data before publishing it.

Import into the quiz question bank (Class 8 and 10 by default):

```bash
cd server && npm run seed:quiz              # classes 8 and 10
cd server && npm run seed:quiz -- --classes 8,10,12
```

Re-running adds only new questions; questions edited in the admin panel are
left alone. Rows with spreadsheet errors (`#ERROR!`), missing options, an
answer other than A–D, or a repeated question are skipped and counted.

## Citation

```
@misc{shafayat2024benqa,
  title={BEnQA: A Question Answering and Reasoning Benchmark for Bengali and English},
  author={Sheikh Shafayat and H M Quamran Hasan and Minhajur Rahman Chowdhury Mahim and Rifki Afina Putri and James Thorne and Alice Oh},
  year={2024},
  eprint={2403.10900},
  archivePrefix={arXiv},
  primaryClass={cs.CL}
}
```
