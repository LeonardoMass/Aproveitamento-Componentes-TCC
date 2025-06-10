import * as React from "react";
import TextField from "@mui/material/TextField";
import Autocomplete, { createFilterOptions } from "@mui/material/Autocomplete";

const filterOptions = createFilterOptions({
  matchFrom: "start",
  stringify: (option) => option.title,
});

export default function Filter({ optionList, label, onChange, onKeyDown, width = 300, value }) {
  return (
    <Autocomplete
      options={optionList}
      value={value}
      getOptionLabel={(option) => option.title}
      filterOptions={filterOptions}
      onChange={onChange}
      sx={{ width }}
      renderInput={(params) => (
        <TextField
          {...params}
          label={label}
          inputProps={{
            ...params.inputProps,
            sx: { padding: "3px", height: 18, },
            onKeyDown: onKeyDown,
          }}
        />
      )}
    />
  );
}
