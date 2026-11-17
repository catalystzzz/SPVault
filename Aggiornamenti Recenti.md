Elenco automatico delle ultime note **modificate** su questo database:
```dataview
LIST file.mtime
FROM ""
WHERE file.name != this.file.name
SORT file.mtime desc
LIMIT 10
```

