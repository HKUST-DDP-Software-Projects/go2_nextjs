"use client";

import Autocomplete from "@/components/autocomplete";
import { programRequirements } from "@/helpers/requirement";
import {
  DegreeSelection,
  setSelectedProgrammes,
} from "@/redux/features/plannerSlice";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import {
  DragDropContext,
  Draggable,
  DropResult,
  Droppable,
} from "@hello-pangea/dnd";
import { PencilIcon, SaveIcon, TrashIcon } from "@heroicons/react/outline";
import { useState } from "react";

export default function ProgrammeSelection() {
  const dispatch = useAppDispatch();
  const courseEnrollments = useAppSelector(
    (state) => state.courseReducer.courseHistory,
  );
  const initialDegrees = useAppSelector(
    (state) => state.plannerReducer.selectedDegrees,
  ).map((degree) => ({
    name: degree.name,
    programmes: degree.requirements.map((programme) => programme.name),
  }));

  const [degrees, setDegrees] = useState<DegreeSelection[]>(initialDegrees);
  const [editingDegreeIndex, setEditingDegreeIndex] = useState<number | null>(
    null,
  );
  const [editingDegreeName, setEditingDegreeName] = useState<string>("");

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
    dispatch(setSelectedProgrammes([courseEnrollments, degrees]));
  };

  const handleProgramSelect = (program: string, degreeId: string) => {
    const degreeIndex = degrees.findIndex((degree) => degree.name === degreeId);
    degrees[degreeIndex].programmes.push(program);
    setDegrees([...degrees]);
    dispatch(setSelectedProgrammes([courseEnrollments, degrees]));
  };

  const handleProgramRemove = (programId: string, degreeId: string) => {
    const degreeIndex = degrees.findIndex((degree) => degree.name === degreeId);
    const programIndex = degrees[degreeIndex].programmes.findIndex(
      (program) => program === programId,
    );
    degrees[degreeIndex].programmes.splice(programIndex, 1);
    setDegrees([...degrees]);
    dispatch(setSelectedProgrammes([courseEnrollments, degrees]));
  };

  const handleDegreeNameEdit = (degreeIndex: number) => {
    setEditingDegreeIndex(degreeIndex);
    setEditingDegreeName(degrees[degreeIndex].name);
  };

  const handleDegreeNameSave = (degreeIndex: number, newName: string) => {
    degrees[degreeIndex].name = newName;
    setDegrees([...degrees]);
    dispatch(setSelectedProgrammes([courseEnrollments, degrees]));
  };

  return (
    <div className="flex flex-col justify-center items-center">
      {/* Add degree button */}
      <button
        className="bg-gray-200 rounded-sm px-4 py-2 mr-2 mb-2"
        onClick={() => {
          setDegrees([
            ...degrees,
            { name: "New program", programmes: [] },
          ] as DegreeSelection[]);
          dispatch(setSelectedProgrammes([courseEnrollments, degrees]));
        }}
      >
        Add degree
      </button>
      <div className="flex">
        <DragDropContext onDragEnd={handleDragEnd}>
          {degrees.map((degree, degreeIndex) => (
            <div key={degree.name} className="p-4 w-96">
              {editingDegreeIndex === degreeIndex ? (
                <div className="flex items-start justify-between">
                  <input
                    type="text"
                    value={editingDegreeName}
                    onChange={(e) =>
                      setEditingDegreeName(e.currentTarget.value)
                    }
                    className="text-lg font-medium mb-2 border-b border-gray-300 focus:outline-none w-full"
                  />
                  <SaveIcon
                    className="h-6 w-6 ml-2 text-green-500 cursor-pointer"
                    onClick={() => {
                      handleDegreeNameSave(degreeIndex, editingDegreeName);
                      setEditingDegreeIndex(null);
                    }}
                  />
                </div>
              ) : (
                <div className="flex items-start justify-between">
                  <h3 className="text-lg font-medium mb-2 text-ellipsis whitespace-nowrap overflow-hidden">
                    {degree.name}
                  </h3>
                  <PencilIcon
                    className="h-6 w-6 ml-2 text-gray-500 cursor-pointer"
                    onClick={() => handleDegreeNameEdit(degreeIndex)}
                  />
                </div>
              )}
              <div className="mt-2">
                <Autocomplete
                  options={programRequirements.map((program) => program.name)}
                  onSelect={(program) =>
                    handleProgramSelect(program, degree.name)
                  }
                  placeholder="Add programme"
                  label=""
                  displayOption={(option) => option}
                  clearOnSelect
                />
              </div>
              <Droppable droppableId={degree.name}>
                {(provided) => (
                  <ul
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    className="border border-gray-300 p-2 rounded-md"
                  >
                    {degree.programmes.map((program, index) => (
                      <Draggable
                        key={`${degreeIndex}-${program}`}
                        draggableId={`${degreeIndex}-${program}`}
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
                              <TrashIcon className="h-5 w-5" />
                            </button>
                          </li>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </ul>
                )}
              </Droppable>
            </div>
          ))}
        </DragDropContext>
      </div>
    </div>
  );
}
