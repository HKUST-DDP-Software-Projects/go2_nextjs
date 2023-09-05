"use client";

import Autocomplete from "@/components/autocomplete";
import { programRequirements } from "@/helpers/requirement";
import { DegreeSelection } from "@/redux/features/plannerSlice";
import {
  DragDropContext,
  Draggable,
  DropResult,
  Droppable,
} from "@hello-pangea/dnd";
import { useState } from "react";

const initialDegrees: DegreeSelection[] = [
  {
    name: "Degree 1",
    programmes: [],
  },
  {
    name: "Degree 2",
    programmes: [],
  },
];

export default function ProgrammeSelection() {
  const [degrees, setDegrees] = useState<DegreeSelection[]>(initialDegrees);

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) {
      return;
    }

    const sourceDegreeIndex = degrees.findIndex(
      (degree) => degree.name === result.source.droppableId,
    );
    const destinationDegreeIndex = degrees.findIndex(
      (degree) => degree.name === result.destination?.droppableId,
    );
    const program = degrees[sourceDegreeIndex].programmes.splice(
      result.source.index,
      1,
    )[0];
    degrees[destinationDegreeIndex].programmes.splice(
      result.destination.index,
      0,
      program,
    );

    setDegrees([...degrees]);
  };

  const handleProgramSelect = (program: string, degreeId: string) => {
    const degreeIndex = degrees.findIndex((degree) => degree.name === degreeId);
    degrees[degreeIndex].programmes.push(program);
    setDegrees([...degrees]);
  };

  const handleProgramRemove = (programId: string, degreeId: string) => {
    const degreeIndex = degrees.findIndex((degree) => degree.name === degreeId);
    const programIndex = degrees[degreeIndex].programmes.findIndex(
      (program) => program === programId,
    );
    degrees[degreeIndex].programmes.splice(programIndex, 1);
    setDegrees([...degrees]);
  };

  return (
    <div className="flex justify-center">
      <DragDropContext onDragEnd={handleDragEnd}>
        {degrees.map((degree) => (
          <div key={degree.name} className="p-4">
            <h3 className="text-lg font-medium mb-2">{degree.name}</h3>
            <Droppable droppableId={degree.name}>
              {(provided) => (
                <ul
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                  className="border border-gray-300 p-2 rounded-md w-96"
                >
                  {degree.programmes.map((program, index) => (
                    <Draggable
                      key={program}
                      draggableId={program}
                      index={index}
                    >
                      {(provided) => (
                        <li
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          ref={provided.innerRef}
                          className="flex justify-between items-center bg-white rounded-md p-2 mb-2 shadow-sm"
                        >
                          <span>{program}</span>
                          <button
                            onClick={() =>
                              handleProgramRemove(program, degree.name)
                            }
                            className="text-red-500 hover:text-red-700"
                          >
                            Remove
                          </button>
                        </li>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </ul>
              )}
            </Droppable>
            <div className="mt-2">
              <Autocomplete
                options={programRequirements.map((program) => program.name)}
                onSelect={(program) =>
                  handleProgramSelect(program, degree.name)
                }
                placeholder="Search for a programme"
                label="Programme"
                displayOption={(option) => option}
                clearOnSelect
              />
            </div>
          </div>
        ))}
      </DragDropContext>
    </div>
  );
}
